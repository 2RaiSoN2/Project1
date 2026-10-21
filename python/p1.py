import sys
import subprocess
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import streamlit as st
import matplotlib.pyplot as plt

# Словник з українськими описами ознак
FEATURE_DESCRIPTIONS = {
    "MedInc": "Медіанний дохід у блоці (у десятках тисяч $)",
    "HouseAge": "Медіанний вік будинків (роки)",
    "AveRooms": "Середня кількість кімнат у житлі",
    "AveBedrms": "Середня кількість спалень",
    "Population": "Кількість населення блоку",
    "AveOccup": "Середня кількість мешканців на домогосподарство",
    "Latitude": "Географічна широта",
    "Longitude": "Географічна довгота",
}

@st.cache_data
def load_data():
    """Завантаження та підготовка датасету California Housing"""
    housing = fetch_california_housing(as_frame=True)
    df = housing.frame.copy()
    # Перейменуємо цільову змінну для зручності
    df.rename(columns={"MedHouseVal": "Price_100k"}, inplace=True)
    df["Price_USD"] = df["Price_100k"] * 100_000
    return housing, df

@st.cache_resource
def train_model(X_train, y_train):
    """Навчання моделі лінійної регресії"""
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model

def run_streamlit_app():
    st.set_page_config(
        page_title="California Housing — Лінійна Регресія",
        page_icon="🏠",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("🏠 Лінійна регресія: California Housing")
    st.markdown(
        """
        Інтерактивний додаток для дослідження датасету **California Housing** 
        та візуалізації роботи моделі **Linear Regression** (`scikit-learn`).
        """
    )

    # Завантаження даних
    housing, df = load_data()
    feature_cols = housing.feature_names
    X = df[feature_cols]
    y = df["Price_100k"]

    # Бічна панель: Параметри моделі
    st.sidebar.header("⚙️ Параметри навчання")
    test_size = st.sidebar.slider(
        "Розмір тестової вибірки (%)",
        min_value=10,
        max_value=40,
        value=20,
        step=5
    ) / 100.0

    random_state = st.sidebar.number_input(
        "Random State (seed)",
        min_value=0,
        max_value=999,
        value=42,
        step=1
    )

    st.sidebar.markdown("---")
    st.sidebar.subheader("ℹ️ Про набір даних")
    st.sidebar.write(
        "Датасет містить інформацію про перепис населення Каліфорнії 1990 року. "
        "Цільова змінна — медіанна вартість будинку в районі."
    )

    # Розбиття та навчання
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    model = train_model(X_train, y_train)
    y_pred = model.predict(X_test)

    # Розрахунок метрик
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    # Вкладки додатку
    tab_data, tab_model, tab_predict = st.tabs([
        "📊 1. Набір даних (Попередній перегляд)",
        "🧠 2. Як працює модель (Метрики та Аналіз)",
        "🔮 3. Інтерактивний прогноз ціни"
    ])

    # ==========================================
    # Вкладка 1: Попередній перегляд даних
    # ==========================================
    with tab_data:
        st.subheader("Огляд набору даних California Housing")

        # Ключова статистика
        col_m1, col_m2, col_m3, col_m4 = st.columns(4)
        col_m1.metric("Всього записів", f"{len(df):,}")
        col_m2.metric("Кількість ознак", len(feature_cols))
        col_m3.metric("Сер. вартість житла", f"${df['Price_USD'].mean():,.0f}")
        col_m4.metric("Медіанна вартість", f"${df['Price_USD'].median():,.0f}")

        st.markdown("---")

        # Налаштування перегляду таблиці
        st.markdown("#### 📋 Попередній перегляд таблиці")
        preview_rows = st.slider("Кількість рядків для відображення:", min_value=5, max_value=50, value=10, step=5)
        
        # Відображення таблиці
        display_df = df[feature_cols + ["Price_USD"]].head(preview_rows)
        st.dataframe(
            display_df.style.format({
                "MedInc": "{:.4f}",
                "HouseAge": "{:.1f}",
                "AveRooms": "{:.2f}",
                "AveBedrms": "{:.2f}",
                "Population": "{:,.0f}",
                "AveOccup": "{:.2f}",
                "Latitude": "{:.2f}",
                "Longitude": "{:.2f}",
                "Price_USD": "${:,.0f}"
            }),
            use_container_width=True
        )

        # Опис ознак
        st.markdown("#### 📖 Опис ознак (Features)")
        desc_cols = st.columns(2)
        for i, (feat, desc) in enumerate(FEATURE_DESCRIPTIONS.items()):
            col_target = desc_cols[i % 2]
            col_target.info(f"**{feat}**: {desc}")

        # Статистичні показники (describe)
        with st.expander("🔍 Переглянути статистичний опис (df.describe())"):
            st.dataframe(df[feature_cols + ["Price_USD"]].describe().T.style.format("{:.2f}"), use_container_width=True)

        # Географічна карта
        with st.expander("🗺️ Географічне розташування об'єктів у Каліфорнії"):
            st.caption("Точки на карті показують розташування районів Каліфорнії з датасету:")
            map_sample = df[["Latitude", "Longitude"]].sample(min(2000, len(df)), random_state=42)
            map_sample.rename(columns={"Latitude": "latitude", "Longitude": "longitude"}, inplace=True)
            st.map(map_sample)

    # ==========================================
    # Вкладка 2: Як працює модель
    # ==========================================
    with tab_model:
        st.subheader("Оцінка якості та принцип роботи лінійної регресії")

        # Метрики якості
        col_r1, col_r2, col_r3, col_r4 = st.columns(4)
        col_r1.metric("MAE (Сер. абсолютна помилка)", f"${mae * 100_000:,.0f}", help="В середньому модель помиляється на цю суму")
        col_r2.metric("RMSE (Сер.-квадратична)", f"${rmse * 100_000:,.0f}", help="Штрафує за великі відхилення сильніше")
        col_r3.metric("MSE", f"{mse:.4f}")
        col_r4.metric("R² (Детермінація)", f"{r2:.4f}", help="Частка дисперсії, яку пояснює модель (ближче до 1 — краще)")

        st.markdown("---")

        col_left, col_right = st.columns([1, 1])

        with col_left:
            st.markdown("#### ⚖️ Коефіцієнти моделі (Вплив ознак на ціну)")
            st.caption(f"Базовий зсув (Intercept $w_0$): **{model.intercept_:.4f}**")

            coef_df = pd.DataFrame({
                "Ознака": feature_cols,
                "Опис": [FEATURE_DESCRIPTIONS[f] for f in feature_cols],
                "Коефіцієнт (вага)": model.coef_
            }).sort_values(by="Коефіцієнт (вага)", ascending=False)

            # Горизонтальна діаграма ваг
            fig, ax = plt.subplots(figsize=(7, 4.5))
            colors = ["#22c55e" if c > 0 else "#ef4444" for c in coef_df["Коефіцієнт (вага)"]]
            ax.barh(coef_df["Ознака"], coef_df["Коефіцієнт (вага)"], color=colors)
            ax.axvline(0, color="#888888", linestyle="--", linewidth=0.8)
            ax.set_xlabel("Значення коефіцієнта")
            ax.set_title("Вплив ознак на ціну (зелений = збільшує, червоний = зменшує)")
            plt.tight_layout()
            st.pyplot(fig)

            st.dataframe(
                coef_df.style.format({"Коефіцієнт (вага)": "{:+.4f}"}),
                use_container_width=True,
                hide_index=True
            )

        with col_right:
            st.markdown("#### 🎯 Графік: Реальні значення vs Прогнози")
            # Вибірка для наочності графіка
            sample_size = min(300, len(y_test))
            sample_indices = np.random.RandomState(42).choice(len(y_test), sample_size, replace=False)
            y_test_sample = np.array(y_test)[sample_indices] * 100_000
            y_pred_sample = np.array(y_pred)[sample_indices] * 100_000

            fig2, ax2 = plt.subplots(figsize=(7, 4.5))
            ax2.scatter(y_test_sample, y_pred_sample, alpha=0.5, color="#3b82f6", edgecolors="none")
            
            # Ідеальна лінія y = x
            min_val = min(y_test_sample.min(), y_pred_sample.min())
            max_val = max(y_test_sample.max(), y_pred_sample.max())
            ax2.plot([min_val, max_val], [min_val, max_val], "r--", label="Ідеальний прогноз (y = x)")
            
            ax2.set_xlabel("Реальна ціна ($)")
            ax2.set_ylabel("Спрогнозована ціна ($)")
            ax2.set_title(f"Порівняння на {sample_size} тестових зразках")
            ax2.legend()
            plt.tight_layout()
            st.pyplot(fig2)

        st.markdown("---")

        # Приклади конкретних прогнозів
        st.markdown("#### 📑 Порівняння реальних цін та прогнозів на тестовій вибірці")
        comparison_df = pd.DataFrame({
            "Реальна ціна ($)": y_test.iloc[:10] * 100_000,
            "Прогноз моделі ($)": y_pred[:10] * 100_000,
        })
        comparison_df["Різниця / Помилка ($)"] = comparison_df["Прогноз моделі ($)"] - comparison_df["Реальна ціна ($)"]
        comparison_df["Помилка (%)"] = (comparison_df["Різниця / Помилка ($)"].abs() / comparison_df["Реальна ціна ($)"]) * 100

        st.dataframe(
            comparison_df.style.format({
                "Реальна ціна ($)": "${:,.0f}",
                "Прогноз моделі ($)": "${:,.0f}",
                "Різниця / Помилка ($)": "{:+,.0f}",
                "Помилка (%)": "{:.1f}%"
            }),
            use_container_width=True
        )

    # ==========================================
    # Вкладка 3: Інтерактивний калькулятор
    # ==========================================
    with tab_predict:
        st.subheader("Введіть характеристики житла для персонального прогнозу:")
        st.caption("Змініть параметри нижче, щоб побачити, яку ціну спрогнозує натренована модель:")

        c1, c2, c3 = st.columns(3)
        with c1:
            in_med_inc = st.slider("Медіанний дохід ($10k)", min_value=0.5, max_value=15.0, value=float(df["MedInc"].median()), step=0.1)
            in_house_age = st.slider("Вік будинку (років)", min_value=1, max_value=52, value=int(df["HouseAge"].median()), step=1)
            in_rooms = st.slider("Середня к-сть кімнат", min_value=1.0, max_value=12.0, value=float(df["AveRooms"].median()), step=0.1)

        with c2:
            in_bedrms = st.slider("Середня к-сть спалень", min_value=0.5, max_value=5.0, value=float(df["AveBedrms"].median()), step=0.1)
            in_pop = st.slider("Населення району", min_value=50, max_value=10000, value=int(df["Population"].median()), step=50)
            in_occup = st.slider("Мешканців на будинок", min_value=1.0, max_value=6.0, value=float(df["AveOccup"].median()), step=0.1)

        with c3:
            in_lat = st.slider("Широта (Latitude)", min_value=32.5, max_value=42.0, value=float(df["Latitude"].median()), step=0.1)
            in_lon = st.slider("Довгота (Longitude)", min_value=-124.5, max_value=-114.0, value=float(df["Longitude"].median()), step=0.1)

        user_input = np.array([[in_med_inc, in_house_age, in_rooms, in_bedrms, in_pop, in_occup, in_lat, in_lon]])
        predicted_val = model.predict(user_input)[0]
        predicted_usd = max(0, predicted_val * 100_000)

        st.markdown("---")
        st.success(f"### 🏷️ Спрогнозована вартість житла: **${predicted_usd:,.0f}** (${predicted_val:.4f} у сотнях тисяч)")

if __name__ == "__main__":
    # Якщо скрипт запущено через `streamlit run`
    if st.runtime.exists():
        run_streamlit_app()
    else:
        # Якщо користувач запустив просто `python p1.py`, автоматично відкриваємо через streamlit
        print("Запуск веб-інтерфейсу Streamlit...")
        subprocess.run([sys.executable, "-m", "streamlit", "run", __file__])
