from flask import Flask, request, jsonify
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

app = Flask(__name__)

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        # Recupera le variabili d'ambiente di Vercel (NON INSERIRE DIRETTAMENTE QUI!)
        SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
        SENDER_EMAIL = os.getenv("SENDER_EMAIL") # L'email da cui invierai (deve essere verificata su SendGrid)
        RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL") # La tua email dove vuoi ricevere i messaggi

        if not all([SENDGRID_API_KEY, SENDER_EMAIL, RECIPIENT_EMAIL]):
            print("Errore: Variabili d'ambiente per email (SENDGRID_API_KEY, SENDER_EMAIL, RECIPIENT_EMAIL) mancanti.")
            return jsonify({'error': 'Server configuration error: Email API keys/addresses missing.'}), 500

        data = request.get_json()

        # Estrai i dati dal form di contatto (assicurati che corrispondano ai 'name' nel tuo HTML)
        name = data.get('name', 'N/A')
        email = data.get('email', 'N/A')
        subject = data.get('subject', 'No Subject')
        message_body = data.get('message', 'No message body')

        # Costruisci il messaggio email
        subject_prefix = "Nuovo Messaggio dal Sito - "
        email_subject = f"{subject_prefix}{subject}"
        email_content = f"""
        <html>
        <body>
            <h3>Nuovo messaggio dal tuo sito web:</h3>
            <p><strong>Nome:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Oggetto:</strong> {subject}</p>
            <p><strong>Messaggio:</strong></p>
            <p>{message_body}</p>
        </body>
        </html>
        """

        # Crea l'oggetto Mail per SendGrid
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=RECIPIENT_EMAIL,
            subject=email_subject,
            html_content=email_content
        )

        # Invia l'email usando SendGrid
        try:
            sendgrid_client = SendGridAPIClient(SENDGRID_API_KEY)
            response = sendgrid_client.send(message)

            # Controlla la risposta di SendGrid per debugging (vedrai nei log di Vercel)
            print(f"SendGrid Status Code: {response.status_code}")
            print(f"SendGrid Body: {response.body}")
            print(f"SendGrid Headers: {response.headers}")

            if response.status_code == 202: # 202 Accepted significa che SendGrid ha accettato la richiesta
                return jsonify({'message': 'Email sent successfully!'}), 200
            else:
                return jsonify({'error': f'Failed to send email via SendGrid. Status: {response.status_code}, Body: {response.body.decode()}'}), 500

        except Exception as e:
            print(f"Errore SendGrid: {e}")
            return jsonify({'error': f'SendGrid API error: {str(e)}'}), 500

    except Exception as e:
        print(f"Errore generale nella funzione send_email: {e}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500