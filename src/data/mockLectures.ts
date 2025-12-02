import { Lecture } from '@/types/lecture';

export const mockLectures: Lecture[] = [
  {
    id: '1',
    subject: 'Computer Science',
    topic: 'Introduction to Machine Learning',
    teacherName: 'Dr. Sharma',
    className: 'CSE 4th Year',
    date: new Date('2024-01-15T10:00:00'),
    duration: 2700, // 45 minutes
    status: 'completed',
    transcript: `Today we'll discuss the fundamentals of machine learning. Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. 

There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. In supervised learning, we train the model using labeled data. The algorithm learns to map inputs to outputs based on example input-output pairs.

Key concepts include features, labels, training data, and model evaluation. We use metrics like accuracy, precision, recall, and F1 score to evaluate our models. Cross-validation is important to ensure our model generalizes well to unseen data.

Popular algorithms include linear regression for continuous outputs, logistic regression for classification, decision trees, random forests, and neural networks. Each has its strengths depending on the problem type and data characteristics.`,
    summary: `This lecture introduced the fundamentals of Machine Learning (ML), a subset of AI that enables systems to learn from experience. The three main types discussed were supervised learning (using labeled data), unsupervised learning, and reinforcement learning. Key concepts covered include features, labels, training data, and model evaluation metrics (accuracy, precision, recall, F1 score). Popular algorithms mentioned include linear regression, logistic regression, decision trees, random forests, and neural networks.`,
    detailedNotes: `# Introduction to Machine Learning

## What is Machine Learning?
- Subset of Artificial Intelligence (AI)
- Enables systems to learn and improve from experience
- No explicit programming required for learning

## Types of Machine Learning

### 1. Supervised Learning
- Uses **labeled data** for training
- Algorithm learns input → output mapping
- Examples: Classification, Regression

### 2. Unsupervised Learning
- Works with **unlabeled data**
- Finds hidden patterns and structures
- Examples: Clustering, Dimensionality Reduction

### 3. Reinforcement Learning
- Agent learns through interaction with environment
- Reward-based learning system

## Key Concepts
- **Features**: Input variables used for prediction
- **Labels**: Output/target variables
- **Training Data**: Dataset used to train the model
- **Model Evaluation**: Assessing model performance

## Evaluation Metrics
| Metric | Description |
|--------|-------------|
| Accuracy | Overall correctness |
| Precision | True positives / Predicted positives |
| Recall | True positives / Actual positives |
| F1 Score | Harmonic mean of precision & recall |

## Popular Algorithms
1. **Linear Regression** - Continuous output prediction
2. **Logistic Regression** - Binary classification
3. **Decision Trees** - Rule-based classification
4. **Random Forests** - Ensemble of decision trees
5. **Neural Networks** - Deep learning models`,
    keyPoints: [
      'Machine Learning is a subset of AI that enables learning from experience',
      'Three main types: Supervised, Unsupervised, and Reinforcement Learning',
      'Supervised learning uses labeled data to learn input-output mappings',
      'Key evaluation metrics: Accuracy, Precision, Recall, F1 Score',
      'Cross-validation ensures model generalizes well to unseen data',
      'Popular algorithms include Linear/Logistic Regression, Decision Trees, Random Forests, Neural Networks',
    ],
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Which type of machine learning uses labeled data for training?',
        options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Semi-supervised Learning'],
        correctAnswer: 'Supervised Learning',
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'What metric is the harmonic mean of precision and recall?',
        options: ['Accuracy', 'F1 Score', 'ROC-AUC', 'Mean Squared Error'],
        correctAnswer: 'F1 Score',
      },
      {
        id: 'q3',
        type: 'short',
        question: 'Explain the difference between supervised and unsupervised learning.',
        correctAnswer: 'Supervised learning uses labeled data where the algorithm learns to map inputs to known outputs. Unsupervised learning works with unlabeled data and finds hidden patterns or structures without predefined outputs.',
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'Which algorithm is best suited for continuous output prediction?',
        options: ['Logistic Regression', 'Decision Trees', 'Linear Regression', 'K-Means Clustering'],
        correctAnswer: 'Linear Regression',
      },
    ],
    tasks: [
      { id: 't1', task: 'Revise the three types of machine learning', completed: false },
      { id: 't2', task: 'Practice calculating precision and recall', completed: false },
      { id: 't3', task: 'Read about neural network architecture', completed: false },
      { id: 't4', task: 'Implement a simple linear regression model', completed: true },
    ],
  },
  {
    id: '2',
    subject: 'Data Structures',
    topic: 'Binary Search Trees',
    teacherName: 'Prof. Verma',
    className: 'CSE 2nd Year',
    date: new Date('2024-01-14T14:00:00'),
    duration: 3000, // 50 minutes
    status: 'completed',
    summary: `This lecture covered Binary Search Trees (BST), a fundamental data structure where each node has at most two children. The key property is that left subtree contains values less than the node, and right subtree contains values greater. Operations covered include insertion, deletion, and traversal methods (inorder, preorder, postorder). Time complexity is O(log n) for balanced trees but can degrade to O(n) for skewed trees.`,
    keyPoints: [
      'BST property: left < node < right',
      'Average time complexity: O(log n)',
      'Worst case (skewed): O(n)',
      'Three traversal methods: Inorder, Preorder, Postorder',
      'Inorder traversal gives sorted order',
    ],
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What is the time complexity of search in a balanced BST?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 'O(log n)',
      },
    ],
    tasks: [
      { id: 't1', task: 'Implement BST insertion and deletion', completed: false },
      { id: 't2', task: 'Practice tree traversal problems', completed: false },
    ],
  },
  {
    id: '3',
    subject: 'Database Systems',
    topic: 'SQL Joins and Subqueries',
    teacherName: 'Dr. Patel',
    className: 'CSE 3rd Year',
    date: new Date('2024-01-13T11:00:00'),
    duration: 2400, // 40 minutes
    status: 'summarizing',
  },
  {
    id: '4',
    subject: 'Operating Systems',
    topic: 'Process Scheduling',
    teacherName: 'Prof. Kumar',
    className: 'CSE 3rd Year',
    date: new Date('2024-01-12T09:00:00'),
    duration: 3600, // 60 minutes
    status: 'transcribing',
  },
];

export const getTotalStats = (lectures: Lecture[]) => {
  const totalLectures = lectures.length;
  const totalSeconds = lectures.reduce((acc, l) => acc + l.duration, 0);
  const totalHours = Math.round(totalSeconds / 3600 * 10) / 10;
  const completedLectures = lectures.filter(l => l.status === 'completed').length;
  
  return {
    totalLectures,
    totalHours,
    completedLectures,
  };
};
