# Importing the required modules
from flask import Flask, make_response, request  # for flask server
from utils import trainLSVCModelAndGetPrediction, checkWhetherEmailSpamOrNot

# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    complaint = (request.get_json())['complaint']
    prediction = trainLSVCModelAndGetPrediction(complaint)
    print('predicted result: ', prediction)
    return make_response(prediction[0], 200)

@app.route('/detect/spam/email', methods=['POST'])
def detectSpamEmail():
    email = (request.get_json())['email']
    prediction = checkWhetherEmailSpamOrNot(email)
    print('prediction: ', prediction)
    resObj = {
        "predicted_value": int(prediction[0]),
        "accuracy": round(float(prediction[1])),
    }
    print('resObj: ', resObj)
    return make_response(resObj, 200)

# main driver function
if __name__ == '__main__':
    # run() method of Flask class runs the application
    # on the local development server.
    app.run(debug=True)
