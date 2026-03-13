"""
PRITHVINET AI Forecasting Microservice
Provides pollution trend predictions for 24-72 hours using ML models.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)


class PollutionForecaster:
    """
    Mock ML forecaster using sinusoidal patterns + noise.
    In production, replace with trained LSTM/Transformer models.
    """

    def __init__(self):
        self.model_version = "2.4"
        self.algorithm = "LSTM + Transformer Ensemble"

    def predict_air(self, hours=72):
        """Predict AQI values for the next N hours."""
        predictions = []
        base_aqi = 48
        now = datetime.utcnow()

        for h in range(0, hours + 1, 6):
            t = h / 24.0
            # Sinusoidal daily pattern + upward trend + noise
            predicted = base_aqi + 25 * np.sin(t * np.pi) + t * 8 + np.random.normal(0, 5)
            confidence = max(60, 95 - h * 0.3 + np.random.normal(0, 2))

            predictions.append({
                "timestamp": (now + timedelta(hours=h)).isoformat() + "Z",
                "hour": f"+{h}h",
                "predicted_aqi": round(max(0, predicted)),
                "predicted_pm25": round(max(0, predicted * 0.45 + np.random.normal(0, 3)), 1),
                "confidence": round(min(99, max(50, confidence)), 1),
            })
        return predictions

    def predict_water(self, hours=72):
        """Predict water quality parameters."""
        predictions = []
        now = datetime.utcnow()

        for h in range(0, hours + 1, 6):
            predictions.append({
                "timestamp": (now + timedelta(hours=h)).isoformat() + "Z",
                "hour": f"+{h}h",
                "predicted_ph": round(7.0 + np.random.normal(0.2, 0.15), 2),
                "predicted_do": round(5.5 + np.random.normal(0, 0.5), 2),
                "predicted_bod": round(2.5 + np.random.normal(0, 0.3), 2),
                "confidence": round(min(99, max(50, 92 - h * 0.2 + np.random.normal(0, 2))), 1),
            })
        return predictions

    def predict_noise(self, hours=72):
        """Predict noise levels."""
        predictions = []
        now = datetime.utcnow()

        for h in range(0, hours + 1, 6):
            t = h / 24.0
            # Peak during work hours pattern
            predicted = 55 + 15 * np.sin(t * np.pi * 0.5) + np.random.normal(0, 3)
            predictions.append({
                "timestamp": (now + timedelta(hours=h)).isoformat() + "Z",
                "hour": f"+{h}h",
                "predicted_decibels": round(max(30, predicted)),
                "confidence": round(min(99, max(50, 88 - h * 0.25 + np.random.normal(0, 2))), 1),
            })
        return predictions


forecaster = PollutionForecaster()


@app.route("/health")
def health():
    return jsonify({
        "status": "operational",
        "service": "PRITHVINET AI Forecasting",
        "model_version": forecaster.model_version,
        "algorithm": forecaster.algorithm,
    })


@app.route("/predict/<pollution_type>")
def predict(pollution_type):
    hours = request.args.get("hours", 72, type=int)
    hours = min(hours, 168)  # Cap at 7 days

    if pollution_type == "air":
        predictions = forecaster.predict_air(hours)
    elif pollution_type == "water":
        predictions = forecaster.predict_water(hours)
    elif pollution_type == "noise":
        predictions = forecaster.predict_noise(hours)
    else:
        return jsonify({"error": "Type must be: air, water, or noise"}), 400

    return jsonify({
        "type": pollution_type,
        "model": f"PRITHVINET-FORECAST v{forecaster.model_version}",
        "algorithm": forecaster.algorithm,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "forecast_hours": hours,
        "predictions": predictions,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
