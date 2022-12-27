# Importing the required modules
from flask import Flask, make_response, request  # for flask server
from utils import getPrediction, checkWhetherEmailSpamOrNot, trainModel, trainModelSpamDataset
import pandas as pd
from decouple import config

MAX_COMPLAINTS = 159
MAX_EMAILS = 5727

# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    complaint = (request.get_json())['complaint']
    print(config('COMPLAINTS_DATASET_PATH'))
    df = pd.DataFrame(pd.read_csv(config('COMPLAINTS_DATASET_PATH')))
    rows = df.shape[0]
    if(rows - MAX_COMPLAINTS >= 100):
        print(rows)
        trainModel()
        prediction = getPrediction(complaint)
        print('retrained trained')
        print('predicted result: ', prediction)
    else:
        prediction = getPrediction(complaint)
        print('already trained')
        print('predicted result: ', prediction)
                
    return make_response(prediction[0], 200)

@app.route('/detect/spam/email', methods=['POST'])
def detectSpamEmail():    
    email = (request.get_json())['email']
    df = pd.DataFrame(pd.read_csv(config('SPAM_EMAILS_DATASET')))
    rows = df.shape[0]

    if(rows - MAX_EMAILS >= 100):
        print(rows)
        print('retrained')
        trainModelSpamDataset()
        prediction = checkWhetherEmailSpamOrNot(email)
        print('prediction: ', prediction[0])
    else:
        print('already trained')
        prediction = checkWhetherEmailSpamOrNot(email)
        print('prediction: ', prediction[0])
    
    resObj = {
        "predicted_value": int(prediction[0]),
    }
    print('resObj: ', resObj)
    return make_response(resObj, 200)

# main driver function
if __name__ == '__main__':
    # run() method of Flask class runs the application
    # on the local development server.
    app.run(debug=True)
