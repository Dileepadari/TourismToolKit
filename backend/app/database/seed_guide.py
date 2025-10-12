"""
Seed guide data - Emergency contacts and culture tips for various Indian states
"""
from sqlmodel import Session, select
from .db import engine
from .models import EmergencyContact, CultureTip
from datetime import datetime

# Emergency contacts for major Indian states
EMERGENCY_CONTACTS_DATA = [
    # National Emergency Numbers
    {"country": "India", "service_type": "police", "number": "100", "description": "Police emergency hotline - available 24/7 nationwide"},
    {"country": "India", "service_type": "medical", "number": "108", "description": "Ambulance and medical emergency services - free nationwide"},
    {"country": "India", "service_type": "fire", "number": "101", "description": "Fire brigade emergency services"},
    {"country": "India", "service_type": "tourist_helpline", "number": "1363", "description": "24x7 Toll Free Multi-Lingual Tourist Helpline"},
    {"country": "India", "service_type": "women_helpline", "number": "1091", "description": "Women in distress helpline"},
    {"country": "India", "service_type": "child_helpline", "number": "1098", "description": "Child helpline for children in need"},
    {"country": "India", "service_type": "disaster", "number": "108/1070", "description": "Disaster management helpline"},
    
    # State-specific tourist helplines
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-11-2336-5358", "description": "Delhi Tourism - information and assistance"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-22-2207-4878", "description": "Maharashtra Tourism - Mumbai"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-80-2235-2828", "description": "Karnataka Tourism - Bangalore"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-44-2538-3333", "description": "Tamil Nadu Tourism - Chennai"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-141-511-0598", "description": "Rajasthan Tourism - Jaipur"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-484-236-7334", "description": "Kerala Tourism - Kochi"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-33-2248-8271", "description": "West Bengal Tourism - Kolkata"},
    {"country": "India", "service_type": "tourist_helpline", "number": "+91-832-243-8750", "description": "Goa Tourism"},
    
    # Railway & Airport helplines
    {"country": "India", "service_type": "railway", "number": "139", "description": "Indian Railways enquiry and assistance"},
    {"country": "India", "service_type": "airport", "number": "+91-11-2567-5121", "description": "Delhi Airport information"},
    {"country": "India", "service_type": "airport", "number": "+91-22-6685-1010", "description": "Mumbai Airport information"},
]

# Culture tips for India
CULTURE_TIPS_DATA = [
    # Greetings
    {
        "country": "India",
        "tip_category": "greeting",
        "tip_text": "Namaste (नमस्ते) is the traditional Indian greeting. Join your palms together at chest level and bow slightly. It's respectful and universally understood across India.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "greeting",
        "tip_text": "When greeting elders, it's customary to touch their feet as a sign of respect. They will usually bless you in return.",
        "language": "en",
        "importance": "medium"
    },
    
    # Dining etiquette
    {
        "country": "India",
        "tip_category": "food",
        "tip_text": "Eating with hands is common and acceptable in India, especially when eating rice or roti. Always use your right hand for eating - the left hand is considered unclean.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "food",
        "tip_text": "Remove your shoes before entering someone's home or a temple. Look for a shoe rack near the entrance.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "food",
        "tip_text": "It's polite to accept food or tea when offered. If you're vegetarian or have dietary restrictions, mention it early - Indians are very accommodating.",
        "language": "en",
        "importance": "medium"
    },
    {
        "country": "India",
        "tip_category": "food",
        "tip_text": "Don't waste food on your plate. Take only what you can eat. Finishing your meal shows appreciation.",
        "language": "en",
        "importance": "medium"
    },
    
    # Dress code
    {
        "country": "India",
        "tip_category": "clothing",
        "tip_text": "Dress modestly when visiting religious places. Cover your shoulders, chest, and knees. Temples may require removing shoes and covering your head.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "clothing",
        "tip_text": "Women should dress conservatively, especially in rural areas and religious sites. Avoid shorts, short skirts, and revealing tops.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "clothing",
        "tip_text": "Wearing traditional Indian clothes like sarees, salwar kameez, or kurtas is appreciated and shows cultural respect.",
        "language": "en",
        "importance": "low"
    },
    
    # Religious customs
    {
        "country": "India",
        "tip_category": "etiquette",
        "tip_text": "Always walk clockwise (parikrama) around temples and religious shrines. Remove leather items before entering Jain temples.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "etiquette",
        "tip_text": "Public displays of affection are frowned upon in India. Avoid kissing or hugging in public, especially in smaller towns.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "etiquette",
        "tip_text": "The head is considered sacred and feet are considered impure. Don't touch anyone's head or point your feet at people or deities.",
        "language": "en",
        "importance": "high"
    },
    
    # Social customs
    {
        "country": "India",
        "tip_category": "customs",
        "tip_text": "When giving or receiving anything, use your right hand or both hands - never just the left hand.",
        "language": "en",
        "importance": "medium"
    },
    {
        "country": "India",
        "tip_category": "customs",
        "tip_text": "The Indian head bobble/wobble means 'yes' or 'I understand'. It's different from shaking your head side to side which means 'no'.",
        "language": "en",
        "importance": "medium"
    },
    {
        "country": "India",
        "tip_category": "customs",
        "tip_text": "Bargaining is expected in markets and with auto-rickshaws (except prepaid services). Start at 50-60% of the asking price.",
        "language": "en",
        "importance": "medium"
    },
    {
        "country": "India",
        "tip_category": "customs",
        "tip_text": "Indians are generally curious and friendly. Don't be surprised if strangers ask personal questions or want selfies with you.",
        "language": "en",
        "importance": "low"
    },
    
    # Photography
    {
        "country": "India",
        "tip_category": "photography",
        "tip_text": "Always ask permission before photographing people, especially women. Some temples prohibit photography inside.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "photography",
        "tip_text": "Photography is strictly prohibited at military installations, airports, and some government buildings. Check for signs.",
        "language": "en",
        "importance": "high"
    },
    
    # Transportation
    {
        "country": "India",
        "tip_category": "transportation",
        "tip_text": "Always negotiate auto-rickshaw fares before starting your journey. Use prepaid taxi services from airports for fixed rates.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "transportation",
        "tip_text": "Traffic can be chaotic. Look both ways multiple times before crossing streets. Follow locals when crossing busy roads.",
        "language": "en",
        "importance": "high"
    },
    
    # Health & Safety
    {
        "country": "India",
        "tip_category": "health",
        "tip_text": "Drink only bottled or filtered water. Avoid street food initially until your stomach adjusts. Carry hand sanitizer always.",
        "language": "en",
        "importance": "high"
    },
    {
        "country": "India",
        "tip_category": "health",
        "tip_text": "Carry basic medicines for stomach issues, common cold, and allergies. Pharmacies are widely available in cities.",
        "language": "en",
        "importance": "medium"
    },
    
    # Festivals
    {
        "country": "India",
        "tip_category": "festivals",
        "tip_text": "During Diwali (October-November), expect fireworks and celebrations. Streets may be crowded. Join in the festivities!",
        "language": "en",
        "importance": "low"
    },
    {
        "country": "India",
        "tip_category": "festivals",
        "tip_text": "Holi (March) is the festival of colors. Wear old clothes and be prepared to get colored powder thrown at you. It's all in good fun!",
        "language": "en",
        "importance": "low"
    },
    
    # Language
    {
        "country": "India",
        "tip_category": "language",
        "tip_text": "English is widely spoken in cities and tourist areas. Learning basic Hindi phrases like 'Dhanyavaad' (thank you) and 'Kitna hai?' (how much?) is appreciated.",
        "language": "en",
        "importance": "medium"
    },
    {
        "country": "India",
        "tip_category": "language",
        "tip_text": "India has 22 official languages. Each state may have its own language. Don't assume everyone speaks Hindi - learn a few words in the local language.",
        "language": "en",
        "importance": "low"
    },
]

def seed_guide_data():
    """Seed emergency contacts and culture tips"""
    with Session(engine) as session:
        # Check if data already exists
        existing_contacts = session.exec(select(EmergencyContact)).first()
        existing_tips = session.exec(select(CultureTip)).first()
        
        if existing_contacts and existing_tips:
            print("⚠️ Guide data already seeded! Skipping...")
            return
        
        print("🧭 Seeding guide data (emergency contacts and culture tips)...")
        
        # Seed emergency contacts
        if not existing_contacts:
            print("📞 Seeding emergency contacts...")
            for contact_data in EMERGENCY_CONTACTS_DATA:
                contact = EmergencyContact(**contact_data)
                session.add(contact)
            print(f"✅ Added {len(EMERGENCY_CONTACTS_DATA)} emergency contacts")
        
        # Seed culture tips
        if not existing_tips:
            print("💡 Seeding culture tips...")
            for tip_data in CULTURE_TIPS_DATA:
                tip = CultureTip(**tip_data)
                session.add(tip)
            print(f"✅ Added {len(CULTURE_TIPS_DATA)} culture tips")
        
        session.commit()
        print(f"✅ Successfully seeded guide data!")
        print(f"   - {len(EMERGENCY_CONTACTS_DATA)} emergency contacts")
        print(f"   - {len(CULTURE_TIPS_DATA)} culture tips")

if __name__ == "__main__":
    seed_guide_data()
