"""Static phrasebook content.

These two fields previously called a ``TourismService`` that is defined nowhere
in the repository, so both raised ``NameError`` at runtime.
"""

from __future__ import annotations

COMMON_PHRASES: dict[str, list[tuple[str, str]]] = {
    "en": [
        ("Hello", "greeting"),
        ("Thank you", "courtesy"),
        ("Please", "courtesy"),
        ("Excuse me", "courtesy"),
        ("How much does this cost?", "shopping"),
        ("Where is the toilet?", "directions"),
        ("I don't understand", "conversation"),
        ("Do you speak English?", "conversation"),
        ("Can you help me?", "conversation"),
        ("Where is the railway station?", "directions"),
    ],
    "hi": [
        ("नमस्ते", "greeting"),
        ("धन्यवाद", "courtesy"),
        ("कृपया", "courtesy"),
        ("माफ़ कीजिए", "courtesy"),
        ("यह कितने का है?", "shopping"),
        ("शौचालय कहाँ है?", "directions"),
        ("मुझे समझ नहीं आया", "conversation"),
        ("क्या आप अंग्रेज़ी बोलते हैं?", "conversation"),
        ("क्या आप मेरी मदद कर सकते हैं?", "conversation"),
        ("रेलवे स्टेशन कहाँ है?", "directions"),
    ],
    "te": [
        ("నమస్కారం", "greeting"),
        ("ధన్యవాదాలు", "courtesy"),
        ("దయచేసి", "courtesy"),
        ("క్షమించండి", "courtesy"),
        ("దీని ధర ఎంత?", "shopping"),
        ("మరుగుదొడ్డి ఎక్కడ ఉంది?", "directions"),
        ("నాకు అర్థం కాలేదు", "conversation"),
        ("మీరు ఇంగ్లీష్ మాట్లాడతారా?", "conversation"),
        ("మీరు నాకు సహాయం చేయగలరా?", "conversation"),
        ("రైల్వే స్టేషన్ ఎక్కడ ఉంది?", "directions"),
    ],
}

EMERGENCY_PHRASES: dict[str, list[tuple[str, str]]] = {
    "en": [
        ("Help!", "emergency"),
        ("Call the police", "emergency"),
        ("I need a doctor", "medical"),
        ("Call an ambulance", "medical"),
        ("There has been an accident", "emergency"),
        ("I am lost", "emergency"),
        ("I have lost my passport", "emergency"),
        ("Where is the nearest hospital?", "medical"),
        ("I am allergic to this", "medical"),
        ("Please call this number", "emergency"),
    ],
    "hi": [
        ("मदद!", "emergency"),
        ("पुलिस को बुलाओ", "emergency"),
        ("मुझे डॉक्टर चाहिए", "medical"),
        ("एम्बुलेंस बुलाओ", "medical"),
        ("एक दुर्घटना हुई है", "emergency"),
        ("मैं रास्ता भटक गया हूँ", "emergency"),
        ("मेरा पासपोर्ट खो गया है", "emergency"),
        ("सबसे नज़दीकी अस्पताल कहाँ है?", "medical"),
        ("मुझे इससे एलर्जी है", "medical"),
        ("कृपया इस नंबर पर कॉल करें", "emergency"),
    ],
    "te": [
        ("సహాయం!", "emergency"),
        ("పోలీసులను పిలవండి", "emergency"),
        ("నాకు వైద్యుడు కావాలి", "medical"),
        ("అంబులెన్స్ పిలవండి", "medical"),
        ("ప్రమాదం జరిగింది", "emergency"),
        ("నేను దారి తప్పాను", "emergency"),
        ("నా పాస్‌పోర్ట్ పోయింది", "emergency"),
        ("దగ్గరలోని ఆసుపత్రి ఎక్కడ ఉంది?", "medical"),
        ("నాకు దీనితో అలెర్జీ ఉంది", "medical"),
        ("దయచేసి ఈ నంబర్‌కు కాల్ చేయండి", "emergency"),
    ],
}


def common(language: str) -> list[tuple[str, str]]:
    return COMMON_PHRASES.get(language, COMMON_PHRASES["en"])


def emergency(language: str) -> list[tuple[str, str]]:
    return EMERGENCY_PHRASES.get(language, EMERGENCY_PHRASES["en"])
