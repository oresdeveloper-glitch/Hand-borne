import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import train


class TrainingSupportTests(unittest.TestCase):
    def test_yolo_backbone_is_recognized(self):
        self.assertIn("yolo", train.BACKBONES_DEFAULT)

    def test_yolo_backbone_is_detected(self):
        self.assertTrue(train.is_yolo_backbone("yolo"))


if __name__ == "__main__":
    unittest.main()
