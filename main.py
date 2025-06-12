from fastapi import FastAPI
from features.controllers import user_controller
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Create tables
Base.metadata.create_all(bind=engine)

# Register routes
app.include_router(user_controller.router)
