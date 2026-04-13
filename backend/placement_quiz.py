
from typing import List, Dict, Union

def get_placement_quiz() -> Dict[str, Union[str, List[Dict[str, Union[str, List[str]]]]]]:
    """
    Returns a placement quiz with a series of questions.
    """
    return {
        "title": "Placement Quiz",
        "questions": [
            {
                "question": "Choose the correct translation for 'I am a cat.'",
                "options": ["Je suis un chat.", "Il est un chat.", "Elle est un chat.", "Nous sommes des chats."],
                "answer": "Je suis un chat."
            },
            {
                "question": "What is the feminine form of 'un ami' (a friend)?",
                "options": ["Une amie", "Un amie", "Une ami", "La amie"],
                "answer": "Une amie"
            },
            {
                "question": "Which of the following means 'we eat'?",
                "options": ["Nous mangeons", "Je mange", "Vous mangez", "Ils mangent"],
                "answer": "Nous mangeons"
            },
            {
                "question": "What is the plural of 'un journal' (a newspaper)?",
                "options": ["Des journaux", "Des journals", "Un journaux", "Les journal"],
                "answer": "Des journaux"
            },
            {
                "question": "Choose the correct verb form: 'Tu ___ (parler) français.'",
                "options": ["parles", "parle", "parlez", "parlons"],
                "answer": "parles"
            }
        ]
    }
