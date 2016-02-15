from flask import render_template, Flask
app = Flask(__name__)

@app.route("/")
def main():
    return render_template('layout.html')

if __name__ == "__main__":
    app.run()
