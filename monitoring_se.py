# cq_realtime_dashboard.py
import streamlit as st
import pandas as pd
import numpy as np
import datetime
import requests
from sqlalchemy import create_engine
import plotly.express as px
import plotly.graph_objs as go

# ---------------------------
# CONFIG
# ---------------------------
DB_URL = "postgresql://user:password@localhost:5432/cqdb"  # <-- change to match config.yaml
PROMETHEUS_URL = "http://localhost:8000/metrics"           # <-- change to match monitoring endpoint

# Auto-refresh every 30s
st.set_page_config(page_title="CQ Meta Model - Real-Time Dashboard", layout="wide")
st_autorefresh = st.experimental_autorefresh(interval=30 * 1000, key="auto_refresh")

# ---------------------------
# DATABASE CONNECTION
# ---------------------------
@st.cache_resource
def get_engine():
    return create_engine(DB_URL)

engine = get_engine()

def load_data():
    df_signals = pd.read_sql(
        "SELECT * FROM signals ORDER BY submission_timestamp DESC LIMIT 500", engine
    )
    df_perf = pd.read_sql(
        "SELECT * FROM model_performance ORDER BY timestamp DESC LIMIT 500", engine
    )
    try:
        df_attribution = pd.read_sql(
            "SELECT * FROM signal_attribution ORDER BY trade_timestamp DESC LIMIT 500", engine
        )
    except Exception:
        df_attribution = pd.DataFrame()
    return df_signals, df_perf, df_attribution

df_signals, df_perf, df_attribution = load_data()

# ---------------------------
# PROMETHEUS METRICS
# ---------------------------
def fetch_prometheus_metrics():
    try:
        r = requests.get(PROMETHEUS_URL, timeout=5)
        metrics_text = r.text.splitlines()
        metrics = {}
        for line in metrics_text:
            if line.startswith("#") or line.strip() == "":
                continue
            parts = line.split()
            if len(parts) == 2:
                metrics[parts[0]] = float(parts[1])
        return metrics
    except Exception as e:
        st.warning(f"Could not fetch Prometheus metrics: {e}")
        return {}

prom_metrics = fetch_prometheus_metrics()

# ---------------------------
# DASHBOARD SECTIONS
# ---------------------------
st.title("📊 CQ Meta Model — Real-Time Dashboard")

# --- Cycle Monitor ---
st.header("⏱ Hourly Cycle Status")
now = datetime.datetime.utcnow()
phases = [
    ("Submission Window", 0, 10),
    ("Freeze", 10, 10),
    ("Scoring", 10, 18),
    ("Ensemble", 18, 23),
    ("Execution Ready", 23, 25)
]
for name, start, end in phases:
    st.write(f"**{name}**: Minute {start}-{end}")

# --- Signals ---
st.header("📥 Latest Model Submissions (Signals)")
if not df_signals.empty:
    st.dataframe(df_signals.head(50))
    fig_sig = px.histogram(df_signals, x="score", nbins=20, title="Signal Score Distribution")
    st.plotly_chart(fig_sig, use_container_width=True)
else:
    st.info("No signals found in database.")

# --- Performance ---
st.header("📈 Model Performance (Latest)")
if not df_perf.empty:
    top_models = df_perf.sort_values("composite_score", ascending=False).head(20)
    st.dataframe(top_models)
    fig_perf = px.bar(top_models, x="model_id", y="composite_score", title="Top Models by Composite Score")
    st.plotly_chart(fig_perf, use_container_width=True)
else:
    st.info("No performance data found.")

# --- Attribution ---
st.header("💰 P&L Attribution")
if not df_attribution.empty:
    st.dataframe(df_attribution.head(20))
    fig_pnl = px.bar(df_attribution, x="model_id", y="realized_pnl", title="Realized P&L by Model")
    st.plotly_chart(fig_pnl, use_container_width=True)
else:
    st.info("No attribution data found.")

# --- Prometheus / System Health ---
st.header("⚙️ System Health (Prometheus)")
if prom_metrics:
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("CPU Utilization", f"{prom_metrics.get('process_cpu_seconds_total', 0):.2f} sec")
    with col2:
        st.metric("Memory Usage (RSS)", f"{prom_metrics.get('process_resident_memory_bytes', 0)/1e6:.2f} MB")
    with col3:
        st.metric("Error Rate", prom_metrics.get("error_rate", 0))

    st.subheader("Raw Prometheus Metrics")
    st.json({k: v for k, v in list(prom_metrics.items())[:20]})
else:
    st.info("No Prometheus metrics available.")

# Footer
st.caption("Auto-refreshes every 30 seconds — live monitoring of CQ Scoring Engine")
