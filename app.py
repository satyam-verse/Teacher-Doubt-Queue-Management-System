from flask import Flask, request
import pymysql

app = Flask(__name__)

db = pymysql.connect(
    host="YOUR-RDS-ENDPOINT",
    user="admin",
    password="YOUR-PASSWORD",
    database="doubtDB"
)

@app.route('/')
def home():
    return "Doubt Queue System Running!"

@app.route('/add')
def add():
    name = request.args.get('name')
    doubt = request.args.get('doubt')

    cursor = db.cursor()
    cursor.execute("INSERT INTO doubts (student_name, doubt) VALUES (%s, %s)", (name, doubt))
    db.commit()

    return "Doubt Added Successfully!"

app.run(host='0.0.0.0', port=80)
