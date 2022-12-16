# Importing the required modules
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
# from sklearn.metrics import accuracy_score

# Joblib is the replacement of pickle as it is more efficient on objects 
# that carry large numpy arrays...
import joblib

from helper import processComplaint, stemSentence, lemmatizedSentence, concat_words, processEmail

# will retrain the model if the dataset change
def trainModel():
    # loading dataset & extracting the two columns
    df = pd.DataFrame(pd.read_csv(r'F:\CUI\QRFS-FYP\Backend Implementation\Flask-Server\QRFS-Complaints--Dataset.csv'))

    # Creating a new column 'category_id' with encoded categories
    df['category_id'] = df['CATEGORY'].factorize()[0]

    # check for duplicates and removing them
    df.drop_duplicates(inplace=True)
    
    # processing the complaints and storing the processed complaints in the database...
    for i in range(len(df)):
        words = processComplaint(df.iloc[i, df.columns.get_loc('COMPLAINT')])
        # print('words: ', words)
        processed_complaint = ' '.join(filter(lambda x: x if x is not None else '', words))
        # print('processed_complaint: ', processed_complaint)
        stemmedSentence = stemSentence(processed_complaint)
        # print('stemmed sentence: ', stemmedSentence)
        lemmatizedWords = lemmatizedSentence(stemmedSentence)
        # print('lemmatized words: ', lemmatizedWords)
        complaint = concat_words(lemmatizedWords)
        df.iloc[i, df.columns.get_loc('COMPLAINT')] = complaint
        # print('complaint: ', complaint)
        
    # saving the processed and cleaned dataset
    df.to_csv('./complaints_processed.csv')
    
    df['COMPLAINT'].isnull().sum()
    
    # cleaning the dataframe
    df = df.dropna()
    
    # splitting the dataset - 80% training & 20% test datasets respectively...
    # Column ‘Complaint’ will be our X or the input and the Category
    # is out Y or the output.
    X = df['COMPLAINT'] # Collection of complaints
    y = df['CATEGORY'] # Target or the labels we want to predict
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=0)
    # X1, X2, y1, y2 = train_test_split(X_train, y_train, test_size=0.20, random_state=0)

    # creating a pipeline and training the model
    clf = Pipeline([
        ('vectorizer', CountVectorizer()), # step-1: convert the text into a vector
        ('nb', MultinomialNB()) # step-2: then apply the MultinomialNB
    ])
    
    clf.fit(X_train, y_train)
    
    # saving the trained model
    joblib.dump(clf, "./recommender.joblib")

def getPrediction(complaint):
    # loading the saved model
    model = joblib.load("./recommender.joblib")
    
    res = model.predict([complaint])
    return res

def trainModelSpamDataset():
    # loading the dataset and storing it in a dataframe using pandas
    df = pd.read_csv(r'F:\FYP (IMPLEMENTATION)\BACKEND\Flask-Server\spam-emails-dataset.csv')

    # check for the duplicates and remove them
    df.drop_duplicates(inplace=True)

    # splitting the samples into 80% train and 20% test datasets respectively... setting the test size to 20%
    X_train, X_test, y_train, y_test = train_test_split(df.Message, df.spam, test_size=0.20, random_state=0)

    # creating a classifier using the pipeline
    clf = Pipeline([
        ('vectorizer', CountVectorizer()), # step-1: convert the text into a vector
        ('nb', MultinomialNB())  # step-2: then apply the MultinomialNB
    ])

    # training the classifier
    # X_train is basically the text in 'Message' column... Previously, first
    # we converted that text into a matrix and then train the model on that
    # matrix values..
    clf.fit(X_train, y_train)
    
    # measuring the accuracy of the classifier
    accuracy = clf.score(X_test, y_test) * 100
    
    print('Accuracy: ', accuracy)
    
    # saving the trained model
    joblib.dump(clf, "./spam-checker.joblib")


def checkWhetherEmailSpamOrNot(email):
    model = joblib.load("./spam-checker.joblib")
    res = model.predict([email])
    return res

