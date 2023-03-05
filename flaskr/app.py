import json
from flask import Flask, render_template, request
import pandas as pd
import pickle
import plotly
import plotly.express as px
from flaskr.src.modules.EPL_WTP import EPL_WinningTeamPrediction
from flaskr.src.modules.processing.dataProcessor import DataProcessor

# Create the application instance
app = Flask(__name__,template_folder="./src/templates",static_folder="public")

# Load the models
knn_model = pickle.load(open('./src/pretrained_models/knn_model.sav', 'rb'))
svm_model = pickle.load(open('./src/pretrained_models/svm_model.sav', 'rb'))
rf_model = pickle.load(open('./src/pretrained_models/random_forest_model.sav', 'rb'))
dt_model = pickle.load(open('./src/pretrained_models/descision_tree_model.sav', 'rb'))

# Load the data
train_data = pd.read_csv("./data/EPL_Final_Dataset_Version_3.csv")
test_data = pd.read_csv("./data/EPL_Final_TestDataset_Version_3.csv")

# Create an object of the EPL_WinningTeamPrediction class
epl_app = EPL_WinningTeamPrediction(
    
    data_processor=DataProcessor(
        
        train_data=train_data,
        test_data=test_data
    )
)

# Process the data
epl_app.process_data()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/evaluate',methods=['GET','POST'])
def evaluateModel():
    """Evaluate the model.
    """
    
    # Get the model curves
    knn_curve = epl_app.evaluate(knn_model)
    svm_curve = epl_app.evaluate(svm_model)
    rf_curve = epl_app.evaluate(rf_model)
    dt_curve = epl_app.evaluate(dt_model)
    
    # Convert the plotly objects to json
    json_plots = json.dumps([knn_curve,svm_curve,rf_curve,dt_curve], cls=plotly.utils.PlotlyJSONEncoder)

    if request.method == 'GET':
        data = json_plots
        return data
    
    return render_template('home.html')

@app.route('/test',methods=['GET','POST'])
def testModel():
    """Test the model.

    Returns:
        [json]: [json object containing the predictions and probabilities]
    """
    
    # Get the predictions and probabilities
    util_test_data = epl_app.data_processor.X_test[:100]
    
    # Get the predictions
    knn_predictions = epl_app.predict(util_test_data,knn_model[0])
    svm_predictions = epl_app.predict(util_test_data,svm_model[0])
    rf_predictions = epl_app.predict(util_test_data,rf_model[0])
    dt_predictions = epl_app.predict(util_test_data,dt_model[0])
    
    # Get the probabilities
    knn_predictions_proba = epl_app.predict_proba(util_test_data,knn_model[0])
    svm_predictions_proba = epl_app.predict_proba(util_test_data,svm_model[0])
    rf_predictions_proba = epl_app.predict_proba(util_test_data,rf_model[0])
    dt_predictions_proba = epl_app.predict_proba(util_test_data,dt_model[0])
    
    # Create a dataframe to store the predictions and probabilities
    all_preds = pd.DataFrame()
    
    # Store the predictions and probabilities in the dataframe
    all_preds["knn"] = knn_predictions
    all_preds["svm"] = svm_predictions
    all_preds["rf"] = rf_predictions
    all_preds["dt"] = dt_predictions
    all_preds["HomeTeam"] = test_data[:100].HomeTeam
    all_preds["AwayTeam"] = test_data[:100].AwayTeam
    all_preds["Result"] = test_data[:100].FTR
    
    # Store the probabilities
    all_preds["knn Home Win %"] = knn_predictions_proba[:,2]
    all_preds["knn Draw %"] = knn_predictions_proba[:,1]
    all_preds["knn Away Win %"] = knn_predictions_proba[:,0]
    
    # Store the probabilities
    all_preds["svm Home Win %"] = svm_predictions_proba[:,2]
    all_preds["svm Draw %"] = svm_predictions_proba[:,1]
    all_preds["svm Away Win %"] = svm_predictions_proba[:,0]
    
    # Store the probabilities
    all_preds["rf Home Win %"] = rf_predictions_proba[:,2]
    all_preds["rf Draw %"] = rf_predictions_proba[:,1]
    all_preds["rf Away Win %"] = rf_predictions_proba[:,0]
    
    all_preds["dt Home Win %"] = dt_predictions_proba[:,2]
    all_preds["dt Draw %"] = dt_predictions_proba[:,1]
    all_preds["dt Away Win %"] = dt_predictions_proba[:,0]
    
    # Convert the dataframe to json
    json_data = all_preds.to_json()
    
    if request.method == 'GET':
        data = json_data
        return data
    
    return render_template('home.html')

@app.route('/predict',methods=['GET','POST'])
def predictGame():
    """Predict the winner of a game.

    Returns:
        [json]: [json object containing the predictions and probabilities]
    """
    
    predict_new_data = epl_app.data_processor.X_test
    
    knn_predictions = epl_app.predict(predict_new_data,knn_model[0])
    svm_predictions = epl_app.predict(predict_new_data,svm_model[0])
    rf_predictions = epl_app.predict(predict_new_data,rf_model[0])
    dt_predictions = epl_app.predict(predict_new_data,dt_model[0])
    
    knn_predictions_proba = epl_app.predict_proba(predict_new_data,knn_model[0])
    svm_predictions_proba = epl_app.predict_proba(predict_new_data,svm_model[0])
    rf_predictions_proba = epl_app.predict_proba(predict_new_data,rf_model[0])
    dt_predictions_proba = epl_app.predict_proba(predict_new_data,dt_model[0])
    
    all_preds = pd.DataFrame()
    
    all_preds["knn"] = knn_predictions
    all_preds["svm"] = svm_predictions
    all_preds["rf"] = rf_predictions
    all_preds["dt"] = dt_predictions
    all_preds["HomeTeam"] = test_data.HomeTeam
    all_preds["AwayTeam"] = test_data.AwayTeam
    all_preds["Result"] = test_data.FTR
    
    all_preds["knn Home Win %"] = knn_predictions_proba[:,2]
    all_preds["knn Draw %"] = knn_predictions_proba[:,1]
    all_preds["knn Away Win %"] = knn_predictions_proba[:,0]
    
    all_preds["svm Home Win %"] = svm_predictions_proba[:,2]
    all_preds["svm Draw %"] = svm_predictions_proba[:,1]
    all_preds["svm Away Win %"] = svm_predictions_proba[:,0]
    
    all_preds["rf Home Win %"] = rf_predictions_proba[:,2]
    all_preds["rf Draw %"] = rf_predictions_proba[:,1]
    all_preds["rf Away Win %"] = rf_predictions_proba[:,0]
    
    all_preds["dt Home Win %"] = dt_predictions_proba[:,2]
    all_preds["dt Draw %"] = dt_predictions_proba[:,1]
    all_preds["dt Away Win %"] = dt_predictions_proba[:,0]
        
    json_data = all_preds.to_json()
        
    if request.method == 'GET':
        data = json_data
        return data
    
    return render_template('home.html')