"""
Seed script to populate the database with beautiful Indian tourist places
with high-quality images from Unsplash
"""

from sqlmodel import Session, select
from .db import get_engine, init_db
from .models import Place
from datetime import datetime
import json

# Tourist places data with Unsplash images
PLACES_DATA = [
    {
        "name": "Taj Mahal",
        "description": "An ivory-white marble mausoleum on the right bank of the river Yamuna. One of the Seven Wonders of the World and a UNESCO World Heritage Site.",
        "country": "India",
        "state": "Uttar Pradesh",
        "city": "Agra",
        "latitude": 27.1751,
        "longitude": 78.0421,
        "category": "monument",
        "images": [
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
            "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 50.0,
        "rating": 4.9
    },
    {
        "name": "Jaipur City Palace",
        "description": "A magnificent palace complex featuring Mughal and Rajasthani architecture. Houses museums with an extensive collection of art, carpets and ancient weapons.",
        "country": "India",
        "state": "Rajasthan",
        "city": "Jaipur",
        "latitude": 26.9258,
        "longitude": 75.8237,
        "category": "palace",
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
            "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
            "https://images.unsplash.com/photo-1603262110225-e5854e1f6952?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "November to February",
        "entry_fee": 30.0,
        "rating": 4.7
    },
    {
        "name": "Hawa Mahal",
        "description": "The Palace of Winds is a stunning five-story pink sandstone structure with 953 small windows. Built for royal ladies to observe street festivals.",
        "country": "India",
        "state": "Rajasthan",
        "city": "Jaipur",
        "latitude": 26.9239,
        "longitude": 75.8267,
        "category": "palace",
        "images": [
            "https://images.unsplash.com/photo-1599661046827-dacff0c0f09b?w=800",
            "https://images.unsplash.com/photo-1603262110225-e5854e1f6952?w=800",
            "https://images.unsplash.com/photo-1610042851028-aa2e0764cc04?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 10.0,
        "rating": 4.6
    },
    {
        "name": "Golden Temple",
        "description": "Harmandir Sahib, the holiest Gurdwara of Sikhism. A stunning gold-plated structure surrounded by a sacred pool.",
        "country": "India",
        "state": "Punjab",
        "city": "Amritsar",
        "latitude": 31.6200,
        "longitude": 74.8765,
        "category": "temple",
        "images": [
            "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800",
            "https://images.unsplash.com/photo-1587416766556-296328ec3d8d?w=800",
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
        ],
        "languages_spoken": ["pa", "hi", "en"],
        "best_time_to_visit": "November to March",
        "entry_fee": 0.0,
        "rating": 4.9
    },
    {
        "name": "Kerala Backwaters",
        "description": "A network of interconnected canals, rivers, lakes and inlets. Experience traditional houseboat cruises through lush green landscapes.",
        "country": "India",
        "state": "Kerala",
        "city": "Alappuzha",
        "latitude": 9.4981,
        "longitude": 76.3388,
        "category": "nature",
        "images": [
            "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
            "https://images.unsplash.com/photo-1593693397690-362cb4d44234?w=800",
            "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800"
        ],
        "languages_spoken": ["ml", "en"],
        "best_time_to_visit": "September to March",
        "entry_fee": None,
        "rating": 4.8
    },
    {
        "name": "Mysore Palace",
        "description": "A historical palace and the royal residence of the Wadiyar dynasty. Known for its Indo-Saracenic architecture and grandeur.",
        "country": "India",
        "state": "Karnataka",
        "city": "Mysore",
        "latitude": 12.3051,
        "longitude": 76.6551,
        "category": "palace",
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
        ],
        "languages_spoken": ["kn", "en"],
        "best_time_to_visit": "October to February",
        "entry_fee": 40.0,
        "rating": 4.7
    },
    {
        "name": "Goa Beaches",
        "description": "Famous for pristine beaches, vibrant nightlife, and Portuguese heritage. Perfect blend of relaxation and adventure.",
        "country": "India",
        "state": "Goa",
        "city": "Panaji",
        "latitude": 15.4909,
        "longitude": 73.8278,
        "category": "beach",
        "images": [
            "https://images.unsplash.com/photo-1544452570-98b5d204d0d3?w=800",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"
        ],
        "languages_spoken": ["en", "hi", "mr"],
        "best_time_to_visit": "November to February",
        "entry_fee": 0.0,
        "rating": 4.7
    },
    {
        "name": "Hampi",
        "description": "Ancient village housing ruins of Vijayanagara Empire. A UNESCO World Heritage Site with stunning temple architecture.",
        "country": "India",
        "state": "Karnataka",
        "city": "Hampi",
        "latitude": 15.3350,
        "longitude": 76.4600,
        "category": "monument",
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"
        ],
        "languages_spoken": ["kn", "en"],
        "best_time_to_visit": "October to February",
        "entry_fee": 20.0,
        "rating": 4.8
    },
    {
        "name": "Qutub Minar",
        "description": "A 73-metre tall tapering tower made of red sandstone. UNESCO World Heritage Site and highest stone tower in India.",
        "country": "India",
        "state": "Delhi",
        "city": "New Delhi",
        "latitude": 28.5244,
        "longitude": 77.1855,
        "category": "monument",
        "images": [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 30.0,
        "rating": 4.5
    },
    {
        "name": "Meenakshi Temple",
        "description": "Historic Hindu temple dedicated to Goddess Meenakshi. Features 14 colorful gopurams with intricate carvings.",
        "country": "India",
        "state": "Tamil Nadu",
        "city": "Madurai",
        "latitude": 9.9195,
        "longitude": 78.1193,
        "category": "temple",
        "images": [
            "https://images.unsplash.com/photo-1588436706487-9d55d73a39e3?w=800",
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
        ],
        "languages_spoken": ["ta", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 0.0,
        "rating": 4.8
    },
    {
        "name": "Valley of Flowers",
        "description": "An enchanting high-altitude valley in the Western Himalayas. UNESCO World Heritage Site known for endemic alpine flowers.",
        "country": "India",
        "state": "Uttarakhand",
        "city": "Chamoli",
        "latitude": 30.7268,
        "longitude": 79.6006,
        "category": "national-park",
        "images": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "July to September",
        "entry_fee": 150.0,
        "rating": 4.9
    },
    {
        "name": "Amber Fort",
        "description": "Majestic fort located on a hilltop, overlooking Maota Lake. Known for its artistic Hindu style elements and stunning mirror work.",
        "country": "India",
        "state": "Rajasthan",
        "city": "Jaipur",
        "latitude": 26.9855,
        "longitude": 75.8513,
        "category": "fort",
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
            "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 25.0,
        "rating": 4.7
    },
    {
        "name": "Khajuraho Temples",
        "description": "Group of Hindu and Jain temples famous for their nagara-style architectural symbolism and erotic sculptures.",
        "country": "India",
        "state": "Madhya Pradesh",
        "city": "Khajuraho",
        "latitude": 24.8318,
        "longitude": 79.9199,
        "category": "temple",
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to February",
        "entry_fee": 40.0,
        "rating": 4.6
    },
    {
        "name": "Ranthambore National Park",
        "description": "One of the largest national parks in northern India. Famous for Bengal tigers and ancient Ranthambore Fort.",
        "country": "India",
        "state": "Rajasthan",
        "city": "Sawai Madhopur",
        "latitude": 26.0173,
        "longitude": 76.5026,
        "category": "national-park",
        "images": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1535338793278-838663aa1787?w=800",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
        ],
        "languages_spoken": ["hi", "en"],
        "best_time_to_visit": "October to April",
        "entry_fee": 1400.0,
        "rating": 4.7
    },
    {
        "name": "Darjeeling Tea Gardens",
        "description": "Sprawling tea estates with breathtaking views of Mount Kanchenjunga. Famous for the world-renowned Darjeeling tea.",
        "country": "India",
        "state": "West Bengal",
        "city": "Darjeeling",
        "latitude": 27.0360,
        "longitude": 88.2627,
        "category": "hill-station",
        "images": [
            "https://images.unsplash.com/photo-1564982612053-742bcd23f8c1?w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
        ],
        "languages_spoken": ["bn", "ne", "hi", "en"],
        "best_time_to_visit": "April to June, September to November",
        "entry_fee": None,
        "rating": 4.8
    },
    {
        "name": "Andaman Islands",
        "description": "Tropical archipelago with pristine beaches, crystal-clear waters, and rich marine life. Perfect for diving and snorkeling.",
        "country": "India",
        "state": "Andaman and Nicobar Islands",
        "city": "Port Blair",
        "latitude": 11.6234,
        "longitude": 92.7265,
        "category": "beach",
        "images": [
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
            "https://images.unsplash.com/photo-1544452570-98b5d204d0d3?w=800"
        ],
        "languages_spoken": ["hi", "en", "bn"],
        "best_time_to_visit": "October to May",
        "entry_fee": None,
        "rating": 4.9
    },
    {
        "name": "Konark Sun Temple",
        "description": "13th-century Sun Temple built in the shape of a giant chariot. UNESCO World Heritage Site with intricate stone carvings.",
        "country": "India",
        "state": "Odisha",
        "city": "Konark",
        "latitude": 19.8876,
        "longitude": 86.0945,
        "category": "temple",
        "images": [
            "https://images.unsplash.com/photo-1588436706487-9d55d73a39e3?w=800",
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"
        ],
        "languages_spoken": ["or", "en"],
        "best_time_to_visit": "October to March",
        "entry_fee": 40.0,
        "rating": 4.7
    },
    {
        "name": "Munnar Hill Station",
        "description": "Beautiful hill town in Kerala's Western Ghats. Known for tea plantations, winding lanes, and cool climate.",
        "country": "India",
        "state": "Kerala",
        "city": "Munnar",
        "latitude": 10.0889,
        "longitude": 77.0595,
        "category": "hill-station",
        "images": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1564982612053-742bcd23f8c1?w=800",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
        ],
        "languages_spoken": ["ml", "en"],
        "best_time_to_visit": "September to May",
        "entry_fee": None,
        "rating": 4.7
    },
    {
        "name": "Gateway of India",
        "description": "Iconic arch-monument overlooking the Arabian Sea. Built to commemorate the visit of King George V and Queen Mary.",
        "country": "India",
        "state": "Maharashtra",
        "city": "Mumbai",
        "latitude": 18.9220,
        "longitude": 72.8347,
        "category": "monument",
        "images": [
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
        ],
        "languages_spoken": ["mr", "hi", "en"],
        "best_time_to_visit": "November to February",
        "entry_fee": 0.0,
        "rating": 4.5
    },
    {
        "name": "Ajanta Caves",
        "description": "Ancient Buddhist cave monuments with beautiful paintings and sculptures. UNESCO World Heritage Site dating back to 2nd century BCE.",
        "country": "India",
        "state": "Maharashtra",
        "city": "Aurangabad",
        "latitude": 20.5519,
        "longitude": 75.7033,
        "category": "monument",
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"
        ],
        "languages_spoken": ["mr", "hi", "en"],
        "best_time_to_visit": "November to March",
        "entry_fee": 40.0,
        "rating": 4.8
    }
]


def seed_places_data():
    """Seed the database with tourist places"""
    engine = get_engine()
    
    # Initialize database tables
    init_db()
    
    with Session(engine) as session:
        # Check if places already exist
        existing_places = session.exec(select(Place)).first()
        
        if existing_places:
            print("⚠️  Places already seeded! Skipping...")
            return
        
        print("🌍 Seeding tourist places...")
        total_places = 0
        
        for place_data in PLACES_DATA:
            place = Place(
                name=place_data["name"],
                description=place_data["description"],
                country=place_data["country"],
                state=place_data["state"],
                city=place_data["city"],
                latitude=place_data["latitude"],
                longitude=place_data["longitude"],
                category=place_data["category"],
                images=json.dumps(place_data["images"]),
                languages_spoken=json.dumps(place_data["languages_spoken"]),
                best_time_to_visit=place_data["best_time_to_visit"],
                entry_fee=place_data["entry_fee"],
                rating=place_data["rating"],
                created_at=datetime.utcnow()
            )
            session.add(place)
            total_places += 1
        
        session.commit()
        print(f"✅ Successfully seeded {total_places} tourist places!")


if __name__ == "__main__":
    seed_places_data()
