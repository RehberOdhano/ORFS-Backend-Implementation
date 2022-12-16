# Importing the required modules
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
import string
# call the nltk downloader
# nltk.download()

punctuations = list(string.punctuation)
eng_stopwords = stopwords.words('english')
other = ["''", '""', '...', '``']

stopwords_list = eng_stopwords + punctuations + other
    
# writing a custom function to tokenize & clean (removing the stopwords, punctuations, 
# oddidites, stemming, lemmatization etc) the complaints...

def processComplaint(complaint):
    tokens = nltk.word_tokenize(complaint)
    stopwords_removed = [token.lower() for token in tokens if token.lower() not in stopwords_list or token.isnumeric()]
    result = [word if word.isalpha() and word is not None else stopwords_list.append(word) for word in stopwords_removed]
    return result

# stemming & lemmatization

# as we can see that the stemmer sees the entire sentence as a word, so it returns it as it is. We need to 
# stem each word in the sentence and return a combined sentence...
# To separate the sentence into words, you can use tokenizer...
def stemSentence(complaint):
    # create an object of class PorterStemmer
    porter = PorterStemmer()

    # print(porter.stem(complaint))
    # print()
    token_words = word_tokenize(complaint)
    token_words
    stem_sentence = []
    for word in token_words:
        stem_sentence.append(porter.stem(word))
        stem_sentence.append(" ")
    return "".join(stem_sentence)


def lemmatizedSentence(complaint):
    lemm = WordNetLemmatizer()
    sentence_words = nltk.word_tokenize(complaint)
    lemmatized_words = []
    for word in sentence_words:
        if word in punctuations:
            sentence_words.remove(word)
        else:
            lemmatized_words.append(lemm.lemmatize(word))
            
    return lemmatized_words

# function to concat processed text/complaint as a single string
def concat_words(processed_complaints):
    # remove any NaN's
    processed_complaints = [i for i in processed_complaints if i is not np.nan or i is not None or i != 'None']
    # print('here: ', processed_complaints[:5])

    concat_words = ''
    for word in processed_complaints:
        # print('hello: ', word)
        concat_words += word + ' '
    return concat_words.strip()

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
