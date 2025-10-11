import strawberry
from strawberry.tools import create_type
from .queries.tts_queries import TTSQueries
from .mutations.tts_mutations import TTSMutations

Queries = create_type("Queries", TTSQueries)
Mutations = create_type("Mutations", TTSMutations)

schema = strawberry.federation.Schema(query=Queries, mutation=Mutations)
