#include <Keypad.h>

#define ROWS  4
#define COLS  3

char keyMap[ROWS][COLS] = 
{
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'*', '0', '#'}
};

uint8_t rowPins[ROWS] = {14, 27, 26, 25}; // rows
uint8_t colPins[COLS] = {33, 32, 18};    //columns

Keypad keypad = Keypad(makeKeymap(keyMap), rowPins, colPins, ROWS, COLS);

String savedPasswords[5];
int passwordCount = 0;    //number of saved passwords
String inputPassword = ""; //password being entered
bool isAddingPassword = false; 
bool isCheckingPassword = false; 

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT); //buzzer
  digitalWrite(13, LOW); //buzzer is off
}

void loop() {
  char key = keypad.getKey();

  if (key) 
  {
    Serial.println(key);

    if (!isAddingPassword && !isCheckingPassword) 
    {
      if (key == '1') 
      {
        if (passwordCount < 5) 
        {
          isAddingPassword = true;
          Serial.println("Enter new 6-character password (start with * and end with #):");
        } 
        else 
        {
          Serial.println("Password limit reached. Cannot add more passwords.");
        }
      } 
      else if (key == '2') 
      {
        isCheckingPassword = true;
        inputPassword = "";
        Serial.println("Enter 6-character password (start with * and end with #):");
      }
    } 
    else if (isAddingPassword) 
    {
      if (key == '#') 
      {
        inputPassword += key;
        Serial.print(inputPassword);
        Serial.print(" ");
        Serial.print(inputPassword.length());
        Serial.print(" ");
        Serial.print(inputPassword[0]);
        Serial.print(" ");
        Serial.println(inputPassword[5]);
        if (inputPassword.length() == 6 && inputPassword.startsWith("*") && inputPassword.endsWith("#"))
        {
          savedPasswords[passwordCount] = inputPassword; //save new password
          passwordCount++;
          Serial.println("New password saved successfully.");
        } 
        else 
        {
          Serial.println("Invalid password format. Must be 6 characters, start with * and end with #.");
        }
        inputPassword = ""; 
        isAddingPassword = false;
      } 
      else 
      {
        inputPassword += key; //add key to inputPassword
      }
    } 
    else if (isCheckingPassword) 
    {
      if (key == '#') 
      {
        inputPassword += key;
        if (inputPassword.length() == 6 && inputPassword.startsWith("*") && inputPassword.endsWith("#")) 
        {
          bool isPasswordCorrect = false;
          for (int i = 0; i < passwordCount; i++) 
          {
            if (inputPassword == savedPasswords[i]) 
            {
              isPasswordCorrect = true;
              break;
            }
          }

          if (isPasswordCorrect) 
          {
            Serial.println("Password correct! Buzzer ON.");
            digitalWrite(13, HIGH);
            delay(2000);       
            digitalWrite(13, LOW); 
          } 
          else 
          {
            Serial.println("Incorrect password.");
          }
        } 
        else 
        {
          Serial.println("Invalid password format.");
        }
        inputPassword = "";
        isCheckingPassword = false;
      } 
      else 
      {
        inputPassword += key;
      }
    }
  }
}
