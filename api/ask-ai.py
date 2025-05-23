from flask import Flask, request, jsonify
import os
import google.generativeai as genai

app = Flask(__name__)

@app.route('/api/ask-ai', methods=['POST'])
def ask_ai():
    try:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

        if not GEMINI_API_KEY:
            print("Errore: GEMINI_API_KEY non trovata nelle variabili d'ambiente di Vercel.")
            return jsonify({'error': 'Server configuration error: AI API key missing.'}), 500

        genai.configure(api_key=GEMINI_API_KEY)

        data = request.get_json()
        user_question = data.get('question')

        if not user_question:
            return jsonify({'error': 'No question provided in the request.'}), 400

        # --- INIZIO LOGICA PER LA SELEZIONE DEL MODELLO ---
        # Tenteremo di usare gemini-1.5-flash come prima scelta
        # Fallback a gemini-pro se flash non è disponibile o non è il nome corretto.
        try:
            list_models_response = genai.list_models()
            available_generative_models = [
                m.name for m in list_models_response
                if 'generateContent' in m.supported_generation_methods
            ]
            print(f"Modelli disponibili che supportano generateContent: {available_generative_models}")

            # Definisci i modelli da provare, in ordine di preferenza
            preferred_model_names = [
                'gemini-1.5-flash',       # La tua prima scelta
                'models/gemini-1.5-flash', # Con prefisso models/
                'gemini-pro',             # Fallback standard
                'models/gemini-pro'       # Fallback standard con prefisso models/
            ]

            model_name_to_use = None
            for model_candidate in preferred_model_names:
                if model_candidate in available_generative_models:
                    model_name_to_use = model_candidate
                    break # Trovato un modello preferito e disponibile, esci dal ciclo

            # Se non è stato trovato nessuno dei modelli preferiti, prova a cercare altri modelli "gemini-pro" o "gemini-1.5-flash"
            if not model_name_to_use:
                for model_name in available_generative_models:
                    if 'gemini-1.5-flash' in model_name:
                        model_name_to_use = model_name
                        break
                    elif 'gemini-pro' in model_name:
                        model_name_to_use = model_name
                        break

            # Ultimo fallback: se ancora nessun modello, usa il primo disponibile
            if not model_name_to_use and available_generative_models:
                model_name_to_use = available_generative_models[0]

            if not model_name_to_use:
                return jsonify({'error': 'No suitable generative model found with "generateContent" capability.'}), 500

            print(f"Usando il modello: {model_name_to_use}")
            model = genai.GenerativeModel(model_name_to_use)

        except Exception as e:
            print(f"Errore durante il recupero dei modelli disponibili: {e}")
            return jsonify({'error': f'Failed to retrieve available models for AI: {str(e)}'}), 500
        # --- FINE LOGICA PER LA SELEZIONE DEL MODELLO ---


        response = model.generate_content(user_question)

        if response.candidates and response.candidates[0].content.parts:
            ai_answer = response.candidates[0].content.parts[0].text
        else:
            ai_answer = "Sorry, I couldn't generate a coherent response."

        return jsonify({'answer': ai_answer})

    except Exception as e:
        print(f"Errore generale nell'elaborazione della richiesta AI: {e}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500