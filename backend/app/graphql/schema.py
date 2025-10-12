import strawberry
from strawberry.tools import create_type
from .queries.tts_queries import TTSQueries
from .mutations.tts_mutations import TTSMutations
from .mutations.mt_mutations import MTMutations
from .queries.mt_queries import MTQueries

Queries = create_type("Queries", TTSQueries+MTQueries)
Mutations = create_type("Mutations", TTSMutations+MTMutations)

schema = strawberry.federation.Schema(query=Queries, mutation=Mutations)
