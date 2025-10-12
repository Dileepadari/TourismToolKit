import strawberry
from strawberry.tools import create_type
from .queries.tts_queries import TTSQueries
from .mutations.tts_mutations import TTSMutations
from .mutations.mt_mutations import MTMutations
from .queries.mt_queries import MTQueries
from .queries.tourism_queries import TourismQueries
from .mutations.tourism_mutations import TourismMutations
from .queries.dictionary_queries import DictionaryQueries
from .mutations.dictionary_mutations import DictionaryMutations
from .queries.places_queries import PlacesQueries
from .queries.guide_queries import GuideQueries
from .queries.ocr_queries import OCRQueries
from .mutations.ocr_mutations import OCRMutations
from .queries.asr_queries import ASRQueries
from .mutations.asr_mutations import ASRMutations

Queries = create_type("Queries", TTSQueries+MTQueries+TourismQueries+DictionaryQueries+PlacesQueries+GuideQueries+OCRQueries+ASRQueries)
Mutations = create_type("Mutations", TTSMutations+MTMutations+TourismMutations+DictionaryMutations+OCRMutations+ASRMutations)

schema = strawberry.Schema(query=Queries, mutation=Mutations)
