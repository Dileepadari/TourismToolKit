import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware

# Import your Query and Mutation from schema
from app.graphql.schema import schema

# Import your TTS router
from app.services.tts import router as tts_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Include TTS router (directly at /tts, not under /graphql)
app.include_router(tts_router)

@app.get("/")
def root():
    return {"message": "TourismToolKit GraphQL API"}
