import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import your Query and Mutation from schema
from app.graphql.schema import schema
from app.database.db import create_tables

app = FastAPI(title="TourismToolKit API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://10.2.129.197:3000", "https://tourismtoolkit.dileepadari.dev", "https://tourism-toolkit.vercel.app"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def root():
    return {"message": "TourismToolKit GraphQL API - All functionality available via GraphQL at /graphql"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend server is running"}

# Add explicit OPTIONS handler for GraphQL endpoint
@app.options("/graphql")
def graphql_options():
    return {"message": "OK"}
