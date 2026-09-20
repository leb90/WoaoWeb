VERSION 5.00
Begin VB.Form Frmayuda 
   BackColor       =   &H00000080&
   BorderStyle     =   0  'None
   Caption         =   "Ayuda Online Aodrag"
   ClientHeight    =   7185
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   6165
   LinkTopic       =   "Form1"
   ScaleHeight     =   7185
   ScaleWidth      =   6165
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.Image Image8 
      Height          =   480
      Left            =   2160
      Picture         =   "Frmayuda.frx":0000
      Top             =   1560
      Width           =   1620
   End
   Begin VB.Image Image7 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":4E61
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":5B2B
      Top             =   5160
      Width           =   1620
   End
   Begin VB.Image Image6 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":AA41
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":B70B
      Top             =   4560
      Width           =   1620
   End
   Begin VB.Image Image5 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":E870
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":F53A
      Top             =   3960
      Width           =   1620
   End
   Begin VB.Image Image4 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":127C5
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":1348F
      Top             =   3360
      Width           =   1620
   End
   Begin VB.Image Image3 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":167A3
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":1746D
      Top             =   2760
      Width           =   1620
   End
   Begin VB.Image Image2 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":1C1FC
      MousePointer    =   99  'Custom
      Picture         =   "Frmayuda.frx":1CEC6
      Top             =   2160
      Width           =   1620
   End
   Begin VB.Image Image1 
      Height          =   480
      Left            =   2160
      MouseIcon       =   "Frmayuda.frx":2199D
      Picture         =   "Frmayuda.frx":22667
      Top             =   6360
      Width           =   1620
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Menú de Ayuda"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   14.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000080&
      Height          =   375
      Left            =   960
      TabIndex        =   0
      Top             =   1560
      Width           =   4095
   End
End
Attribute VB_Name = "Frmayuda"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Dim variable As String
Dim ie       As Object

Private Sub Command1_Click()

End Sub

Private Sub Command2_Click()

End Sub

Private Sub Command3_Click()

End Sub

Private Sub Command4_Click()

End Sub

Private Sub Command5_Click()

End Sub

Private Sub Command6_Click()

End Sub

Private Sub Form_Load()

    Frmayuda.Picture = cLoadPicture(DirInterfaces & "ventanas.jpg")

End Sub

Private Sub Image1_Click()

    Unload Me

End Sub

Private Sub Image2_Click()

    Unload Me
    frmTeclas.Show vbModal

End Sub

Private Sub Image3_Click()

    Unload Me
    frmComandos.Show vbModal

End Sub

Private Sub Image4_Click()

    variable = "https://world-of-ao.fandom.com/es/wiki/World_Of_AO_Wiki"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 255, _
            255, 255, True, False, False)

End Sub

Private Sub Image5_Click()

    variable = "http://www.Worldofao.online"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 255, _
            255, 255, True, False, False)

End Sub

Private Sub Image6_Click()

    variable = "https://world-of-ao.fandom.com/es/wiki/World_Of_AO_Wiki"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 255, _
            255, 255, True, False, False)

End Sub

Private Sub Image7_Click()

    variable = "https://discord.com/invite/wPRGZEt"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 255, _
            255, 255, True, False, False)

End Sub

Private Sub Image8_Click()

    Call frmConstruir.Show

End Sub
