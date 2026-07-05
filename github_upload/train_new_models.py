import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['MKL_THREADING_LAYER'] = 'GNU'

import sys
sys.argv = ['train.py', '--train-all', '--epochs', '30', '--batch-size', '16', '--img-size', '224']

exec(open('train.py').read())
