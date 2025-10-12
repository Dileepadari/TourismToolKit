"""
Seed script to populate the database with mock dictionary entries
for all supported languages.
"""

from sqlmodel import Session, select
from .db import get_engine, init_db
from .models import DictionaryEntry, User
from datetime import datetime

# Mock dictionary data for all 13 languages
MOCK_DICTIONARY_DATA = {
    # English to Hindi
    ("en", "hi"): [
        {"word": "Hello", "translation": "नमस्ते", "pronunciation": "Namaste", "usage_example": "Hello! How are you? - नमस्ते! आप कैसे हैं?"},
        {"word": "Thank you", "translation": "धन्यवाद", "pronunciation": "Dhanyavaad", "usage_example": "Thank you very much! - बहुत धन्यवाद!"},
        {"word": "Welcome", "translation": "स्वागत है", "pronunciation": "Swagat hai", "usage_example": "Welcome to India! - भारत में आपका स्वागत है!"},
        {"word": "Goodbye", "translation": "अलविदा", "pronunciation": "Alvida", "usage_example": "Goodbye, see you later - अलविदा, फिर मिलेंगे"},
        {"word": "Please", "translation": "कृपया", "pronunciation": "Kripya", "usage_example": "Please help me - कृपया मेरी मदद करें"},
        {"word": "Sorry", "translation": "माफ़ करें", "pronunciation": "Maaf karen", "usage_example": "Sorry for the inconvenience - असुविधा के लिए खेद है"},
        {"word": "Yes", "translation": "हाँ", "pronunciation": "Haan", "usage_example": "Yes, I agree - हाँ, मैं सहमत हूँ"},
        {"word": "No", "translation": "नहीं", "pronunciation": "Nahin", "usage_example": "No, I don't want - नहीं, मुझे नहीं चाहिए"},
        {"word": "Water", "translation": "पानी", "pronunciation": "Paani", "usage_example": "I need water - मुझे पानी चाहिए"},
        {"word": "Food", "translation": "खाना", "pronunciation": "Khaana", "usage_example": "Delicious food - स्वादिष्ट खाना"},
    ],
    
    # English to Telugu
    ("en", "te"): [
        {"word": "Hello", "translation": "నమస్కారం", "pronunciation": "Namaskaram", "usage_example": "Hello! How are you? - నమస్కారం! మీరు ఎలా ఉన్నారు?"},
        {"word": "Thank you", "translation": "ధన్యవాదాలు", "pronunciation": "Dhanyavadalu", "usage_example": "Thank you very much! - చాలా ధన్యవాదాలు!"},
        {"word": "Welcome", "translation": "స్వాగతం", "pronunciation": "Swagatam", "usage_example": "Welcome to Hyderabad! - హైదరాబాద్‌కు స్వాగతం!"},
        {"word": "Goodbye", "translation": "వీడ్కోలు", "pronunciation": "Veedkolu", "usage_example": "Goodbye, see you - వీడ్కోలు, మళ్ళీ కలుద్దాం"},
        {"word": "Please", "translation": "దయచేసి", "pronunciation": "Dayachesi", "usage_example": "Please help - దయచేసి సహాయం చేయండి"},
        {"word": "Sorry", "translation": "క్షమించండి", "pronunciation": "Kshamincandi", "usage_example": "Sorry for the delay - ఆలస్యానికి క్షమించండి"},
        {"word": "Yes", "translation": "అవును", "pronunciation": "Avunu", "usage_example": "Yes, correct - అవును, సరైనది"},
        {"word": "No", "translation": "కాదు", "pronunciation": "Kaadu", "usage_example": "No, not now - కాదు, ఇప్పుడు కాదు"},
        {"word": "Water", "translation": "నీళ్ళు", "pronunciation": "Neellu", "usage_example": "Cold water - చల్లని నీళ్ళు"},
        {"word": "Food", "translation": "ఆహారం", "pronunciation": "Aaharam", "usage_example": "Traditional food - సాంప్రదాయ ఆహారం"},
    ],
    
    # English to Tamil
    ("en", "ta"): [
        {"word": "Hello", "translation": "வணக்கம்", "pronunciation": "Vanakkam", "usage_example": "Hello! How are you? - வணக்கம்! எப்படி இருக்கிறீர்கள்?"},
        {"word": "Thank you", "translation": "நன்றி", "pronunciation": "Nandri", "usage_example": "Thank you very much! - மிக்க நன்றி!"},
        {"word": "Welcome", "translation": "வரவேற்கிறேன்", "pronunciation": "Varaverpkirēṉ", "usage_example": "Welcome to Chennai! - சென்னைக்கு வரவேற்கிறேன்!"},
        {"word": "Goodbye", "translation": "பிரியாவிடை", "pronunciation": "Piriyāviṭai", "usage_example": "Goodbye, take care - பிரியாவிடை, கவனமாக இருங்கள்"},
        {"word": "Please", "translation": "தயவுசெய்து", "pronunciation": "Tayavuceytu", "usage_example": "Please wait - தயவுசெய்து காத்திருங்கள்"},
        {"word": "Sorry", "translation": "மன்னிக்கவும்", "pronunciation": "Maṉṉikkavum", "usage_example": "Sorry for the mistake - தவறுக்கு மன்னிக்கவும்"},
        {"word": "Yes", "translation": "ஆம்", "pronunciation": "Ām", "usage_example": "Yes, I understand - ஆம், எனக்கு புரிகிறது"},
        {"word": "No", "translation": "இல்லை", "pronunciation": "Illai", "usage_example": "No, I can't - இல்லை, என்னால் முடியாது"},
        {"word": "Water", "translation": "தண்ணீர்", "pronunciation": "Taṇṇīr", "usage_example": "Drinking water - குடிநீர்"},
        {"word": "Food", "translation": "உணவு", "pronunciation": "Uṇavu", "usage_example": "Tasty food - சுவையான உணவு"},
    ],
    
    # English to Kannada
    ("en", "kn"): [
        {"word": "Hello", "translation": "ನಮಸ್ಕಾರ", "pronunciation": "Namaskāra", "usage_example": "Hello! How are you? - ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?"},
        {"word": "Thank you", "translation": "ಧನ್ಯವಾದಗಳು", "pronunciation": "Dhan'yavādagaḷu", "usage_example": "Thank you very much! - ತುಂಬಾ ಧನ್ಯವಾದಗಳು!"},
        {"word": "Welcome", "translation": "ಸ್ವಾಗತ", "pronunciation": "Svāgata", "usage_example": "Welcome to Bangalore! - ಬೆಂಗಳೂರಿಗೆ ಸ್ವಾಗತ!"},
        {"word": "Goodbye", "translation": "ವಿದಾಯ", "pronunciation": "Vidāya", "usage_example": "Goodbye, see you soon - ವಿದಾಯ, ಶೀಘ್ರದಲ್ಲಿ ಭೇಟಿಯಾಗೋಣ"},
        {"word": "Please", "translation": "ದಯವಿಟ್ಟು", "pronunciation": "Dayaviṭṭu", "usage_example": "Please come - ದಯವಿಟ್ಟು ಬನ್ನಿ"},
        {"word": "Sorry", "translation": "ಕ್ಷಮಿಸಿ", "pronunciation": "Kṣamisi", "usage_example": "Sorry for being late - ತಡವಾಗಿ ಬಂದಿದಕ್ಕೆ ಕ್ಷಮಿಸಿ"},
        {"word": "Yes", "translation": "ಹೌದು", "pronunciation": "Haudu", "usage_example": "Yes, that's right - ಹೌದು, ಅದು ಸರಿ"},
        {"word": "No", "translation": "ಇಲ್ಲ", "pronunciation": "Illa", "usage_example": "No problem - ಯಾವುದೇ ಸಮಸ್ಯೆ ಇಲ್ಲ"},
        {"word": "Water", "translation": "ನೀರು", "pronunciation": "Nīru", "usage_example": "Fresh water - ತಾಜಾ ನೀರು"},
        {"word": "Food", "translation": "ಆಹಾರ", "pronunciation": "Āhāra", "usage_example": "Spicy food - ಮಸಾಲೆಯುಕ್ತ ಆಹಾರ"},
    ],
    
    # English to Malayalam
    ("en", "ml"): [
        {"word": "Hello", "translation": "നമസ്കാരം", "pronunciation": "Namaskāraṁ", "usage_example": "Hello! How are you? - നമസ്കാരം! സുഖമാണോ?"},
        {"word": "Thank you", "translation": "നന്ദി", "pronunciation": "Nandi", "usage_example": "Thank you very much! - വളരെ നന്ദി!"},
        {"word": "Welcome", "translation": "സ്വാഗതം", "pronunciation": "Svāgataṁ", "usage_example": "Welcome to Kerala! - കേരളത്തിലേക്ക് സ്വാഗതം!"},
        {"word": "Goodbye", "translation": "വിട", "pronunciation": "Viṭa", "usage_example": "Goodbye, take care - വിട, സൂക്ഷിച്ചു പോകുക"},
        {"word": "Please", "translation": "ദയവായി", "pronunciation": "Dayavāyi", "usage_example": "Please sit - ദയവായി ഇരിക്കുക"},
        {"word": "Sorry", "translation": "ക്ഷമിക്കണം", "pronunciation": "Kṣamikkaṇaṁ", "usage_example": "Sorry for the trouble - ബുദ്ധിമുട്ടിന് ക്ഷമിക്കണം"},
        {"word": "Yes", "translation": "ഉവ്വ്", "pronunciation": "Uvv", "usage_example": "Yes, I will come - ഉവ്വ്, ഞാൻ വരാം"},
        {"word": "No", "translation": "ഇല്ല", "pronunciation": "Illa", "usage_example": "No, not today - ഇല്ല, ഇന്ന് വേണ്ട"},
        {"word": "Water", "translation": "വെള്ളം", "pronunciation": "Veḷḷaṁ", "usage_example": "Hot water - ചൂടുവെള്ളം"},
        {"word": "Food", "translation": "ഭക്ഷണം", "pronunciation": "Bhakṣaṇaṁ", "usage_example": "Kerala food - കേരള ഭക്ഷണം"},
    ],
    
    # English to Bengali
    ("en", "bn"): [
        {"word": "Hello", "translation": "নমস্কার", "pronunciation": "Namaskār", "usage_example": "Hello! How are you? - নমস্কার! আপনি কেমন আছেন?"},
        {"word": "Thank you", "translation": "ধন্যবাদ", "pronunciation": "Dhan'yabāda", "usage_example": "Thank you very much! - অনেক ধন্যবাদ!"},
        {"word": "Welcome", "translation": "স্বাগতম", "pronunciation": "Sbāgatama", "usage_example": "Welcome to Kolkata! - কলকাতায় স্বাগতম!"},
        {"word": "Goodbye", "translation": "বিদায়", "pronunciation": "Bidāẏa", "usage_example": "Goodbye, see you - বিদায়, আবার দেখা হবে"},
        {"word": "Please", "translation": "অনুগ্রহ করে", "pronunciation": "Anugraha karē", "usage_example": "Please help - অনুগ্রহ করে সাহায্য করুন"},
        {"word": "Sorry", "translation": "দুঃখিত", "pronunciation": "Duḥkhita", "usage_example": "Sorry for the mistake - ভুলের জন্য দুঃখিত"},
        {"word": "Yes", "translation": "হ্যাঁ", "pronunciation": "Hyām̐", "usage_example": "Yes, I know - হ্যাঁ, আমি জানি"},
        {"word": "No", "translation": "না", "pronunciation": "Nā", "usage_example": "No, I don't - না, আমি করি না"},
        {"word": "Water", "translation": "জল", "pronunciation": "Jala", "usage_example": "Clean water - পরিষ্কার জল"},
        {"word": "Food", "translation": "খাবার", "pronunciation": "Khābāra", "usage_example": "Bengali food - বাংলা খাবার"},
    ],
    
    # English to Gujarati
    ("en", "gu"): [
        {"word": "Hello", "translation": "નમસ્તે", "pronunciation": "Namastē", "usage_example": "Hello! How are you? - નમસ્તે! તમે કેમ છો?"},
        {"word": "Thank you", "translation": "આભાર", "pronunciation": "Ābhāra", "usage_example": "Thank you very much! - ખૂબ ખૂબ આભાર!"},
        {"word": "Welcome", "translation": "સ્વાગત છે", "pronunciation": "Svāgata chē", "usage_example": "Welcome to Gujarat! - ગુજરાતમાં સ્વાગત છે!"},
        {"word": "Goodbye", "translation": "આવજો", "pronunciation": "Āvajō", "usage_example": "Goodbye, take care - આવજો, સાચવજો"},
        {"word": "Please", "translation": "કૃપા કરીને", "pronunciation": "Kr̥pā karīnē", "usage_example": "Please wait - કૃપા કરીને રાહ જુઓ"},
        {"word": "Sorry", "translation": "માફ કરશો", "pronunciation": "Māpha karaśō", "usage_example": "Sorry for the delay - મોડા થવા બદલ માફ કરશો"},
        {"word": "Yes", "translation": "હા", "pronunciation": "Hā", "usage_example": "Yes, sure - હા, ચોક્કસ"},
        {"word": "No", "translation": "ના", "pronunciation": "Nā", "usage_example": "No, thanks - ના, આભાર"},
        {"word": "Water", "translation": "પાણી", "pronunciation": "Pāṇī", "usage_example": "Drinking water - પીવાનું પાણી"},
        {"word": "Food", "translation": "ખોરાક", "pronunciation": "Khōrāka", "usage_example": "Gujarati food - ગુજરાતી ખોરાક"},
    ],
    
    # English to Marathi
    ("en", "mr"): [
        {"word": "Hello", "translation": "नमस्कार", "pronunciation": "Namaskār", "usage_example": "Hello! How are you? - नमस्कार! तुम्ही कसे आहात?"},
        {"word": "Thank you", "translation": "धन्यवाद", "pronunciation": "Dhan'yavāda", "usage_example": "Thank you very much! - खूप खूप धन्यवाद!"},
        {"word": "Welcome", "translation": "स्वागत आहे", "pronunciation": "Svāgata āhē", "usage_example": "Welcome to Mumbai! - मुंबईत स्वागत आहे!"},
        {"word": "Goodbye", "translation": "निरोप", "pronunciation": "Nirōpa", "usage_example": "Goodbye, see you - निरोप, भेटू"},
        {"word": "Please", "translation": "कृपया", "pronunciation": "Kr̥payā", "usage_example": "Please come - कृपया या"},
        {"word": "Sorry", "translation": "माफ करा", "pronunciation": "Māpha karā", "usage_example": "Sorry for the inconvenience - गैरसोयीबद्दल माफ करा"},
        {"word": "Yes", "translation": "होय", "pronunciation": "Hōya", "usage_example": "Yes, correct - होय, बरोबर"},
        {"word": "No", "translation": "नाही", "pronunciation": "Nāhī", "usage_example": "No, not now - नाही, आता नाही"},
        {"word": "Water", "translation": "पाणी", "pronunciation": "Pāṇī", "usage_example": "Cold water - थंड पाणी"},
        {"word": "Food", "translation": "अन्न", "pronunciation": "Anna", "usage_example": "Marathi food - मराठी अन्न"},
    ],
    
    # English to Punjabi
    ("en", "pa"): [
        {"word": "Hello", "translation": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "pronunciation": "Sat srī akāl", "usage_example": "Hello! How are you? - ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?"},
        {"word": "Thank you", "translation": "ਧੰਨਵਾਦ", "pronunciation": "Dhan'navāda", "usage_example": "Thank you very much! - ਬਹੁਤ ਧੰਨਵਾਦ!"},
        {"word": "Welcome", "translation": "ਜੀ ਆਇਆਂ ਨੂੰ", "pronunciation": "Jī ā'i'āṁ nū", "usage_example": "Welcome to Punjab! - ਪੰਜਾਬ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ!"},
        {"word": "Goodbye", "translation": "ਅਲਵਿਦਾ", "pronunciation": "Alavidā", "usage_example": "Goodbye, take care - ਅਲਵਿਦਾ, ਖਿਆਲ ਰੱਖਣਾ"},
        {"word": "Please", "translation": "ਕਿਰਪਾ ਕਰਕੇ", "pronunciation": "Kirapā karakē", "usage_example": "Please help - ਕਿਰਪਾ ਕਰਕੇ ਮਦਦ ਕਰੋ"},
        {"word": "Sorry", "translation": "ਮਾਫ਼ ਕਰਨਾ", "pronunciation": "Māfa karanā", "usage_example": "Sorry for being late - ਦੇਰ ਹੋਣ ਲਈ ਮਾਫ਼ ਕਰਨਾ"},
        {"word": "Yes", "translation": "ਹਾਂ", "pronunciation": "Hāṁ", "usage_example": "Yes, I agree - ਹਾਂ, ਮੈਂ ਸਹਿਮਤ ਹਾਂ"},
        {"word": "No", "translation": "ਨਹੀਂ", "pronunciation": "Nahīṁ", "usage_example": "No, I don't want - ਨਹੀਂ, ਮੈਨੂੰ ਨਹੀਂ ਚਾਹੀਦਾ"},
        {"word": "Water", "translation": "ਪਾਣੀ", "pronunciation": "Pāṇī", "usage_example": "Fresh water - ਤਾਜ਼ਾ ਪਾਣੀ"},
        {"word": "Food", "translation": "ਖਾਣਾ", "pronunciation": "Khāṇā", "usage_example": "Punjabi food - ਪੰਜਾਬੀ ਖਾਣਾ"},
    ],
    
    # English to Urdu
    ("en", "ur"): [
        {"word": "Hello", "translation": "السلام علیکم", "pronunciation": "Assalamu alaikum", "usage_example": "Hello! How are you? - السلام علیکم! آپ کیسے ہیں؟"},
        {"word": "Thank you", "translation": "شکریہ", "pronunciation": "Shukriya", "usage_example": "Thank you very much! - بہت شکریہ!"},
        {"word": "Welcome", "translation": "خوش آمدید", "pronunciation": "Khush āmdīd", "usage_example": "Welcome to Pakistan! - پاکستان میں خوش آمدید!"},
        {"word": "Goodbye", "translation": "الوداع", "pronunciation": "Alvidā", "usage_example": "Goodbye, see you - الوداع، پھر ملیں گے"},
        {"word": "Please", "translation": "براہ مہربانی", "pronunciation": "Barāh-i-mehrbānī", "usage_example": "Please help - براہ مہربانی مدد کریں"},
        {"word": "Sorry", "translation": "معاف کیجئے", "pronunciation": "Muāf kījiye", "usage_example": "Sorry for the trouble - تکلیف کے لیے معاف کیجئے"},
        {"word": "Yes", "translation": "جی ہاں", "pronunciation": "Jī hāṁ", "usage_example": "Yes, I understand - جی ہاں، میں سمجھتا ہوں"},
        {"word": "No", "translation": "نہیں", "pronunciation": "Nahīṁ", "usage_example": "No, not now - نہیں، ابھی نہیں"},
        {"word": "Water", "translation": "پانی", "pronunciation": "Pānī", "usage_example": "Clean water - صاف پانی"},
        {"word": "Food", "translation": "کھانا", "pronunciation": "Khānā", "usage_example": "Delicious food - مزیدار کھانا"},
    ],
    
    # English to Assamese
    ("en", "as"): [
        {"word": "Hello", "translation": "নমস্কাৰ", "pronunciation": "Namaskāra", "usage_example": "Hello! How are you? - নমস্কাৰ! আপুনি কেনে আছে?"},
        {"word": "Thank you", "translation": "ধন্যবাদ", "pronunciation": "Dhan'yabāda", "usage_example": "Thank you very much! - বহুত ধন্যবাদ!"},
        {"word": "Welcome", "translation": "স্বাগতম", "pronunciation": "Sbāgatama", "usage_example": "Welcome to Assam! - অসমলৈ স্বাগতম!"},
        {"word": "Goodbye", "translation": "বিদায়", "pronunciation": "Bidāya", "usage_example": "Goodbye, see you - বিদায়, আকৌ সাক্ষাৎ হ'ব"},
        {"word": "Please", "translation": "অনুগ্ৰহ কৰি", "pronunciation": "Anugraha kari", "usage_example": "Please wait - অনুগ্ৰহ কৰি অপেক্ষা কৰক"},
        {"word": "Sorry", "translation": "ক্ষমা কৰিব", "pronunciation": "Kṣamā kariba", "usage_example": "Sorry for the mistake - ভুলৰ বাবে ক্ষমা কৰিব"},
        {"word": "Yes", "translation": "হয়", "pronunciation": "Haẏa", "usage_example": "Yes, I know - হয়, মই জানো"},
        {"word": "No", "translation": "নহয়", "pronunciation": "Nahaẏa", "usage_example": "No, I don't - নহয়, মই নকৰো"},
        {"word": "Water", "translation": "পানী", "pronunciation": "Pānī", "usage_example": "Fresh water - সতেজ পানী"},
        {"word": "Food", "translation": "খাদ্য", "pronunciation": "Khādya", "usage_example": "Assamese food - অসমীয়া খাদ্য"},
    ],
    
    # English to Odia
    ("en", "or"): [
        {"word": "Hello", "translation": "ନମସ୍କାର", "pronunciation": "Namaskāra", "usage_example": "Hello! How are you? - ନମସ୍କାର! ଆପଣ କେମିତି ଅଛନ୍ତି?"},
        {"word": "Thank you", "translation": "ଧନ୍ୟବାଦ", "pronunciation": "Dhan'yabāda", "usage_example": "Thank you very much! - ବହୁତ ଧନ୍ୟବାଦ!"},
        {"word": "Welcome", "translation": "ସ୍ୱାଗତ", "pronunciation": "Sbāgata", "usage_example": "Welcome to Odisha! - ଓଡ଼ିଶାକୁ ସ୍ୱାଗତ!"},
        {"word": "Goodbye", "translation": "ବିଦାୟ", "pronunciation": "Bidāẏa", "usage_example": "Goodbye, see you - ବିଦାୟ, ପୁଣି ଦେଖା ହେବ"},
        {"word": "Please", "translation": "ଦୟାକରି", "pronunciation": "Dayākari", "usage_example": "Please help - ଦୟାକରି ସାହାଯ୍ୟ କରନ୍ତୁ"},
        {"word": "Sorry", "translation": "କ୍ଷମା କରନ୍ତୁ", "pronunciation": "Kṣamā karantu", "usage_example": "Sorry for the trouble - ଅସୁବିଧା ପାଇଁ କ୍ଷମା କରନ୍ତୁ"},
        {"word": "Yes", "translation": "ହଁ", "pronunciation": "Haṁ", "usage_example": "Yes, I understand - ହଁ, ମୁଁ ବୁଝୁଛି"},
        {"word": "No", "translation": "ନା", "pronunciation": "Nā", "usage_example": "No, not today - ନା, ଆଜି ନୁହେଁ"},
        {"word": "Water", "translation": "ପାଣି", "pronunciation": "Pāṇi", "usage_example": "Clean water - ପରିଷ୍କାର ପାଣି"},
        {"word": "Food", "translation": "ଖାଦ୍ୟ", "pronunciation": "Khādya", "usage_example": "Odia food - ଓଡ଼ିଆ ଖାଦ୍ୟ"},
    ],
}


def seed_dictionary_data():
    """Seed the database with mock dictionary entries"""
    engine = get_engine()
    init_db()
    
    with Session(engine) as session:
        # Check if we already have a system user for dictionary entries
        system_user = session.exec(
            select(User).where(User.email == "system@tourismtoolkit.com")
        ).first()
        
        if not system_user:
            # Create a system user for public dictionary entries
            system_user = User(
                email="system@tourismtoolkit.com",
                username="system",
                password_hash="system",  # This is just for seed data
                full_name="System Dictionary",
                preferred_language="en",
                is_verified=True,
                is_active=True
            )
            session.add(system_user)
            session.commit()
            session.refresh(system_user)
        
        # Check if we already have dictionary entries
        existing_entries = session.exec(
            select(DictionaryEntry).where(DictionaryEntry.user_id == system_user.id)
        ).first()
        
        if existing_entries:
            print("Dictionary entries already exist. Skipping seed.")
            return
        
        # Add all mock dictionary entries
        total_entries = 0
        for (lang_from, lang_to), entries in MOCK_DICTIONARY_DATA.items():
            for entry_data in entries:
                entry = DictionaryEntry(
                    user_id=system_user.id,
                    word=entry_data["word"],
                    translation=entry_data["translation"],
                    language_from=lang_from,
                    language_to=lang_to,
                    pronunciation=entry_data.get("pronunciation"),
                    usage_example=entry_data.get("usage_example"),
                    tags=None,
                    is_favorite=False,
                    created_at=datetime.utcnow()
                )
                session.add(entry)
                total_entries += 1
        
        session.commit()
        print(f"✅ Successfully seeded {total_entries} dictionary entries!")


if __name__ == "__main__":
    seed_dictionary_data()
