VERSION 5.00
Begin VB.Form frmPartyGeneral 
   BorderStyle     =   0  'None
   Caption         =   "Opciones de party"
   ClientHeight    =   6555
   ClientLeft      =   2460
   ClientTop       =   570
   ClientWidth     =   6960
   LinkTopic       =   "Opciones de party"
   Picture         =   "frmPartyGeneral.frx":0000
   ScaleHeight     =   6555
   ScaleWidth      =   6960
   ShowInTaskbar   =   0   'False
   Begin VB.ListBox List1 
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   1530
      Left            =   240
      TabIndex        =   2
      Top             =   480
      Width           =   2295
   End
   Begin VB.CheckBox Check1 
      DownPicture     =   "frmPartyGeneral.frx":1DC7B
      Height          =   255
      Left            =   5160
      MouseIcon       =   "frmPartyGeneral.frx":23726
      MousePointer    =   99  'Custom
      Picture         =   "frmPartyGeneral.frx":243F0
      Style           =   1  'Graphical
      TabIndex        =   1
      ToolTipText     =   "Si marcas la opción [PRIVADA] tu grupo no será visible en el listado de grupos disponibles."
      Top             =   4650
      Width           =   1095
   End
   Begin VB.TextBox Text1 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00404080&
      BorderStyle     =   0  'None
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H80000009&
      Height          =   480
      Left            =   3480
      TabIndex        =   0
      Top             =   4500
      Width           =   1650
   End
   Begin VB.Image Image7 
      Height          =   495
      Left            =   2040
      MouseIcon       =   "frmPartyGeneral.frx":290F7
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   3255
   End
   Begin VB.Image Image6 
      Height          =   495
      Left            =   1920
      MouseIcon       =   "frmPartyGeneral.frx":29DC1
      MousePointer    =   99  'Custom
      Top             =   2880
      Width           =   3255
   End
   Begin VB.Image Image5 
      Height          =   495
      Left            =   1920
      MouseIcon       =   "frmPartyGeneral.frx":2AA8B
      MousePointer    =   99  'Custom
      Top             =   3360
      Width           =   3375
   End
   Begin VB.Image Image4 
      Height          =   495
      Left            =   2040
      MouseIcon       =   "frmPartyGeneral.frx":2B755
      MousePointer    =   99  'Custom
      Top             =   3960
      Width           =   3135
   End
   Begin VB.Image Image3 
      Height          =   495
      Left            =   5040
      MouseIcon       =   "frmPartyGeneral.frx":2C41F
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   1815
   End
   Begin VB.Image Image2 
      Height          =   495
      Left            =   2640
      MouseIcon       =   "frmPartyGeneral.frx":2D0E9
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   1935
   End
   Begin VB.Image Image1 
      Height          =   495
      Left            =   1920
      MouseIcon       =   "frmPartyGeneral.frx":2DDB3
      MousePointer    =   99  'Custom
      Top             =   5040
      Width           =   3375
   End
   Begin VB.Label Label13 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Introduce Nombre"
      BeginProperty Font 
         Name            =   "Comic Sans MS"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000040&
      Height          =   255
      Left            =   3480
      TabIndex        =   5
      Top             =   4680
      Width           =   1455
   End
   Begin VB.Label Label11 
      Appearance      =   0  'Flat
      BackColor       =   &H00008080&
      BackStyle       =   0  'Transparent
      Caption         =   $"frmPartyGeneral.frx":2EA7D
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   1575
      Left            =   2640
      TabIndex        =   4
      Top             =   480
      Width           =   3975
   End
   Begin VB.Label Label7 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H0000FFFF&
      BorderStyle     =   1  'Fixed Single
      Caption         =   "No estás invitado a ninguna party"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H80000008&
      Height          =   255
      Left            =   1080
      TabIndex        =   3
      Top             =   5600
      Width           =   4935
   End
End
Attribute VB_Name = "frmPartyGeneral"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Command1_Click()

    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Form_Load()

    'frmPartyGeneral.Picture = cLoadPicture(DirInterfaces & "Partygeneral.jpg")
    Call SendData("PT7")

End Sub

Private Sub Image1_Click()

    Call SendData("/party " & frmPartyGeneral.Check1.value & "," & frmPartyGeneral.Text1.Text)
    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Image2_Click()

    Call SendData("/unirme")
    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Image3_Click()

    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Image4_Click()

    Call SendData("PY")

End Sub

Private Sub Image5_Click()

    Call SendData("/salirparty")
    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Image6_Click()

    Call SendData("/salirparty")
    frmPartyGeneral.Visible = False
    Unload frmPartyGeneral

End Sub

Private Sub Image7_Click()

    Call SendData("/soli " & ReadField(1, frmPartyGeneral.List1.List(frmPartyGeneral.List1.ListIndex), 44))

End Sub

