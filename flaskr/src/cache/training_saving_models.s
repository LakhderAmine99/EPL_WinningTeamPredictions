from src.modules.EPL_WTP import EPL_WinningTeamPrediction
import pandas as pd
import pickle

train_data = pd.read_csv("./data/EPL_Final_Dataset_Version_3.csv")
test_data = pd.read_csv("./data/EPL_Final_TestDataset_Version_3.csv")

app = EPL_WinningTeamPrediction(train_data,test_data)

app.process_data()

svm_model = app.SVM_Model()
knn_model = app.KNeighbors_Model()
dt_model = app.Descision_Tree_Model()
rf_model = app.Random_Forest_Model()

svm = 'svm_model.sav'
random_forest = 'random_forest_model.sav'
knn = 'knn_model.sav'
descision_tree = 'descision_tree_model.sav'

pickle.dump(svm_model, open(svm, 'wb'))
pickle.dump(rf_model, open(random_forest, 'wb'))
pickle.dump(knn_model, open(knn, 'wb'))
pickle.dump(dt_model, open(descision_tree, 'wb'))
