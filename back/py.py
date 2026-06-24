from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np, pickle, tensorflow as tf

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Load pre-trained model and scaler
model  = tf.keras.models.load_model("model.h5")
scaler = pickle.load(open("scaler.pkl", "rb"))

PRODUCTS = {
    0: ("55% Leche - Almendra",     "leche",  "frutos_secos", 55),
    1: ("55% Leche - Canela",       "leche",  "especias",     55),
    2: ("55% Leche - Hierba Luisa", "leche",  "herbal",       55),
    3: ("55% Leche - Maracuyá",     "leche",  "tropical",     55),
    4: ("55% Leche - Menta",        "leche",  "mentolado",    55),
    5: ("55% Leche - Naranja",      "leche",  "cítrico",      55),
    6: ("75% Oscuro - Almendra",    "oscuro", "frutos_secos", 75),
    7: ("75% Oscuro - Canela",      "oscuro", "especias",     75),
    8: ("75% Oscuro - Hierba Luisa", "oscuro", "herbal",      75),
    9: ("75% Oscuro - Menta",       "oscuro", "mentolado",    75),
}

class Session(BaseModel):
    cat_preference: int
    flavor_preference: int
    items_in_cart: int
    subtotal: float
    time_on_catalog_s: int
    viewed_detail: int
    cacao_avg_cart: float

@app.post("/predict")
def predict(s: Session):
    X = np.array([[s.cat_preference, s.flavor_preference, s.items_in_cart,
                   s.subtotal, s.time_on_catalog_s, s.viewed_detail, s.cacao_avg_cart]])
    X_scaled = scaler.transform(X)
    probs     = model.predict(X_scaled, verbose=0)[0]
    top3      = np.argsort(probs)[::-1][:3]
    
    # Return the format that the frontend expects
    top_id = int(top3[0])
    product_info = PRODUCTS[top_id]
    
    return {
        "product_id": top_id,
        "name": product_info[0],
        "category": product_info[1],
        "flavor": product_info[2],
        "cacao_percent": product_info[3],
        "confidence": float(probs[top_id]),
        "top_3_ids": [int(x) for x in top3]
    }

@app.get("/products")
def get_products():
    # Return products for the frontend catalog
    return {
        pid: {"name": info[0], "category": info[1], "flavor": info[2], "cacao": info[3]}
        for pid, info in PRODUCTS.items()
    }

# To run: uvicorn py:app --reload --port 8000