import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import serve


class ValidationTests(unittest.TestCase):
    def test_dataset_image_should_pass_validation(self):
        image_path = os.path.join(
            os.path.dirname(__file__),
            '..',
            'Dataset',
            'Training',
            'NORMAL',
            'IMG0000363.jpg',
        )

        with open(image_path, 'rb') as f:
            result = serve.validate_image_contents(f.read())

        self.assertTrue(result['ok'], msg=f'Expected validation to pass, got: {result}')


if __name__ == '__main__':
    unittest.main()
