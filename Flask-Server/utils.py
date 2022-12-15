# Importing the required modules
# import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from nltk.corpus import stopwords
import string


def trainLSVCModelAndGetPrediction(complaint):

    # loading dataset & extracting the two columns
    df = pd.DataFrame(pd.read_csv(r'F:\FYP (IMPLEMENTATION)\BACKEND\Flask-Server\QRFS-Complaints--Dataset.csv'))
    df = df.loc[:, ["CATEGORY", "COMPLAINT"]]

    # Because the computation is time consuming (in terms of CPU), the data was sampled
    df2 = df.sample(100, random_state=1, replace=True).copy()

    # Creating a new column 'category_id' with encoded categories
    df2['category_id'] = df2['CATEGORY'].factorize()[0]

    # removing the duplicates
    df2[['CATEGORY', 'category_id']].drop_duplicates()

    # text processing using TfidfVectorizer
    tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5, ngram_range=(1, 2), stop_words='english')

    # We transform each complaint into a vector
    features = tfidf.fit_transform(df2.COMPLAINT).toarray()
    labels = df2.category_id

    # splitting the dataset - 80% training & 20% test datasets respectively...
    # Column ‘Complaint’ will be our X or the input and the Category
    # is out Y or the output.
    X = df2['COMPLAINT']  # Collection of documents
    y = df2['CATEGORY']  # Target or the labels we want to predict
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

    # training the model
    X_train, X_test, y_train, y_test, indices_train, indices_test = train_test_split(features, labels, df2.index, test_size=0.25, random_state=1)
    model = LinearSVC()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # predict the output/target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
    tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5,ngram_range=(1, 2), stop_words='english')
    fitted_vectorizer = tfidf.fit(X_train)
    tfidf_vectorizer_vectors = fitted_vectorizer.transform(X_train)
    model = LinearSVC().fit(tfidf_vectorizer_vectors, y_train)
    res = model.predict(fitted_vectorizer.transform([complaint]))

    return res

# custom function which will process the text
def processEmail(email):

    # stop words in english
    stop_words = set(stopwords.words('english'))

    # step-01: remove punctuation marks
    noPuncText = [char for char in email if char not in string.punctuation]
    noPuncText = ''.join(noPuncText)

    # step-02: remove stopwords
    cleanWords = [word for word in noPuncText.split() if word.lower() not in stop_words]

    # step-03: return a list of clean text words
    return cleanWords


def checkWhetherEmailSpamOrNot(email):
    # loading the dataset and storing it in a dataframe using pandas
    df = pd.read_csv(r'F:\FYP (IMPLEMENTATION)\BACKEND\Flask-Server\spam-emails-dataset.csv')

    # check for the duplicates and remove them
    df.drop_duplicates(inplace=True)

    # # downloading the stopword packages using nltk
    # nltk.download('stopwords')

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

    # predict
    result = clf.predict([email])

    # measuring the accuracy of the classifier
    accuracy = clf.score(X_test, y_test) * 100

    return (result, accuracy)
