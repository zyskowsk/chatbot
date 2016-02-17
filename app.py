import json
import random
import time

from flask import render_template, Flask, jsonify, request

from chatbot import ChatBot

app = Flask(__name__)
chatbot = ChatBot()


@app.route('/')
def main():
    return render_template('layout.html')

@app.route('/chat', methods=['POST'])
def chat():
    # Sleep before returning the response for a better UX
    time.sleep(random.random())

    data = json.loads(request.get_data())
    response = chatbot.get_response(data.get('message', ''))
    return jsonify(**response)

if __name__ == "__main__":
    app.run()
