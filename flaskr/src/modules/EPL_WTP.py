from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import roc_curve,roc_auc_score
from sklearn.preprocessing import label_binarize
from itertools import cycle
import numpy as np
import plotly.graph_objects as go
import pandas as pd
from pandas.plotting import scatter_matrix
import matplotlib.pyplot as plt
import plotly.express as px

class EPL_WinningTeamPrediction(object):
    """ This class is used to predict the winning team of a match in the English Premier League.
        It uses the following models:
        1. Support Vector Machine
        2. Random Forest
        3. Descision Tree
        4. K-Nearest Neighbors
    
        _args_
        
        data_processor: DataProcessor object
    """
    
    def __init__(self,data_processor):
        self._data_processor = data_processor
        
    @property
    def data_processor(self):
        return self._data_processor
    
    @data_processor.setter
    def data_processor(self,processor):
        self._data_processor = processor
        
    def process_data(self):
        self.data_processor.engineer()
        
    def SVM_Model(self,kernel='poly',probability=True):
        """Support Vector Machine Model for EPL Winning Team Prediction Model.

        Args:
            kernel (str, optional): _description_. Defaults to 'poly'.
            probability (bool, optional): _description_. Defaults to True.
        """
        
        clf = SVC(kernel=kernel,probability=True)

        y_pred = clf.fit(self.data_processor.X_train,self.data_processor.y_train).predict(self.data_processor.X_train)
        score = accuracy_score(y_pred,self.data_processor.y_train)

        svm_model = clf.fit(self.data_processor.X_train,self.data_processor.y_train)
        
        return[svm_model,score]
    
    def Random_Forest_Model(self):
        """Random Forest Model for EPL Winning Team Prediction Model.
        """
        
        clf = RandomForestClassifier(n_estimators=10, max_depth=5, random_state=0)
        
        y_pred = clf.fit(self.data_processor.X_train,self.data_processor.y_train).predict(self.data_processor.X_train)
        score = accuracy_score(y_pred,self.data_processor.y_train)

        rf_model = clf.fit(self.data_processor.X_train,self.data_processor.y_train)
        
        return[rf_model,score]
    
    def Descision_Tree_Model(self):
        """Descision Tree Model for EPL Winning Team Prediction Model.
        """
        
        clf = DecisionTreeClassifier(max_depth=5)
        
        y_pred = clf.fit(self.data_processor.X_train,self.data_processor.y_train).predict(self.data_processor.X_train)
        score = accuracy_score(y_pred,self.data_processor.y_train)

        dt_model = clf.fit(self.data_processor.X_train,self.data_processor.y_train)
        
        return[dt_model,score]
    
    def KNeighbors_Model(self):
        """K-Nearest Neighbors Model for EPL Winning Team Prediction Model.
        """
        
        clf = KNeighborsClassifier(n_neighbors = 10)
        
        y_pred = clf.fit(self.data_processor.X_train,self.data_processor.y_train).predict(self.data_processor.X_train)
        score = accuracy_score(y_pred,self.data_processor.y_train)

        knn_model = clf.fit(self.data_processor.X_train,self.data_processor.y_train)
        
        return[knn_model,score]
    
    def trainModels(self):
        """Trains all the models and returns the models and their scores.
        """
        
        svm_model,svm_score = self.SVM_Model()
        rf_model,rf_score = self.Random_Forest_Model()
        dt_model,dt_score = self.Descision_Tree_Model()
        knn_model,knn_score = self.KNeighbors_Model()
        
        return[svm_model,svm_score,rf_model,rf_score,dt_model,dt_score,knn_model,knn_score]
    
    def predict(self,data,model):
        """Predicts the winning team of a match.

        Args:
            data (_type_): _description_
            model (_type_): _description_

        Returns:
            _type_: _description_
        """
    
        prediction = model.predict(data)
        return prediction
    
    def predict_proba(self,data,model):
        """Predicts the probability of the winning team of a match.

        Args:
            data (_type_): _description_
            model (_type_): _description_

        Returns:
            _type_: _description_
        """
        
        prediction_probabilities = model.predict_proba(data)
        return prediction_probabilities
    
    def evaluate(self,model_data):
        """Evaluates the model.

        Args:
            model_data (_type_): _description_
        """
        
        model = model_data[0]
        score = model_data[1]
        
        y_test_binarized=label_binarize(self.data_processor.y_test[:150],classes=np.unique(self.data_processor.y_test))
        
        fig = go.Figure()
        fig.add_shape(
            type="line" , line=dict(dash='dash'),
            x0=0, x1=1, y0=0, y1=1
        )
        
        pred_proba = self.predict_proba(self.data_processor.X_test[:150],model)
        
        for i in range(pred_proba.shape[1]):
            y_true = y_test_binarized[:, i]
            y_score = pred_proba[:, i]

            fpr, tpr, _ = roc_curve(y_true, y_score)
            auc_score = roc_auc_score(y_true, y_score)

            name = f"{y_test_binarized[i]} (AUC={auc_score:.2f})"
            fig.add_trace(go.Scatter(x=fpr, y=tpr, name=name, mode='lines'))

        fig.update_layout(
            xaxis_title='False Positive Rate',
            yaxis_title='True Positive Rate',
            yaxis=dict(scaleanchor="y", scaleratio=1),
            xaxis=dict(constrain='domain'),
            width=800, height=650
        )
                
        return[fig,pred_proba,fpr,tpr,score]