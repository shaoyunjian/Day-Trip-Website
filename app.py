from flask import *
from api.attraction import attraction
from api.category import category
from api.user import user
from api.booking import booking
from api.order import order
app=Flask(__name__)

app.register_blueprint(attraction)
app.register_blueprint(category)
app.register_blueprint(user)
app.register_blueprint(booking)
app.register_blueprint(order)

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"]=False


# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000)