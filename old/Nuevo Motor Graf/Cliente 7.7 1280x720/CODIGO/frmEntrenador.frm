VERSION 5.00
Begin VB.Form frmEntrenador 
   BorderStyle     =   0  'None
   ClientHeight    =   4380
   ClientLeft      =   0
   ClientTop       =   -105
   ClientWidth     =   6765
   ControlBox      =   0   'False
   BeginProperty Font 
      Name            =   "Tahoma"
      Size            =   8.25
      Charset         =   0
      Weight          =   400
      Underline       =   0   'False
      Italic          =   0   'False
      Strikethrough   =   0   'False
   EndProperty
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmEntrenador.frx":0000
   ScaleHeight     =   4380
   ScaleWidth      =   6765
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.ListBox lstCriaturas 
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   1920
      Left            =   1320
      TabIndex        =   0
      Top             =   840
      Width           =   4140
   End
   Begin VB.Image Image2 
      Height          =   375
      Left            =   3600
      MouseIcon       =   "frmEntrenador.frx":F79F
      MousePointer    =   99  'Custom
      Top             =   3720
      Width           =   1695
   End
   Begin VB.Image Image1 
      Height          =   375
      Left            =   1440
      MouseIcon       =   "frmEntrenador.frx":10469
      MousePointer    =   99  'Custom
      Top             =   3720
      Width           =   1575
   End
End
Attribute VB_Name = "frmEntrenador"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Form_Load()

    frmEntrenador.Picture = cLoadPicture(DirInterfaces & "ventanas.jpg")
    Call Audio.PlayWave("177.wav")

End Sub

Private Sub Command1_Click()

    Call SendData("ENTR" & lstCriaturas.ListIndex + 1)
    Unload Me

End Sub

Private Sub Command2_Click()

    Unload Me

End Sub

Private Sub Form_Deactivate()

    Me.SetFocus

End Sub

Private Sub Image1_Click()

    Call SendData("ENTR" & lstCriaturas.ListIndex + 1)
    Unload Me

End Sub

Private Sub Image2_Click()

    Unload Me

End Sub
