import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

# Import your Query and Mutation from schema
from app.graphql.schema import schema

app = FastAPI()
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def root():
    return {"message": "TourismToolKit GraphQL API"}
