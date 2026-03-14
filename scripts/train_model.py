import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

# Configuration for Agri-vision training
DATA_DIR = "./dataset/plantvillage"  # Directory where dataset should be placed
BATCH_SIZE = 32
EPOCHS = 25
LEARNING_RATE = 0.001
IMAGE_SIZE = 224

def train_model():
    # 1. Advanced Augmentation for field conditions
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(IMAGE_SIZE),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.2, contrast=0.2), # Mimic lighting variations
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Load Dataset (Expects folders by disease name)
    # Get high-level dataset from: https://www.kaggle.com/datasets/abdallahalansary/plantvillage-dataset
    image_datasets = {x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x])
                      for x in ['train', 'val']}
    
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True)
                   for x in ['train', 'val']}
    
    class_names = image_datasets['train'].classes
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # 3. Model Architecture (ResNet50 Transfer Learning)
    model = models.resnet50(pretrained=True)
    num_ftrs = model.fc.in_features
    # Output layer size matches number of diseased/healthy classes
    model.fc = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)

    # 4. Critical Agricultural Loss Function
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # 5. Training Loop
    print(f"Starting training on {device}...")
    for epoch in range(EPOCHS):
        for phase in ['train', 'val']:
            if phase == 'train': model.train()
            else: model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(image_datasets[phase])
            epoch_acc = running_corrects.double() / len(image_datasets[phase])
            print(f'Epoch {epoch}/{EPOCHS-1} {phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # 6. Save specialized weights
    torch.save(model.state_dict(), 'ceres_vision_v1.pth')
    print("Model trained and weights saved as 'ceres_vision_v1.pth'")

if __name__ == "__main__":
    if os.path.exists(DATA_DIR):
        train_model()
    else:
        print(f"Error: Dataset not found at {DATA_DIR}")
        print("Please download the PlantVillage dataset to proceed with high-level training.")
