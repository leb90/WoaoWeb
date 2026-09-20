VERSION 5.00
Begin VB.Form frmCajas 
   BorderStyle     =   0  'None
   ClientHeight    =   7185
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   6150
   LinkTopic       =   "Form1"
   Picture         =   "frmCajas.frx":0000
   ScaleHeight     =   7185
   ScaleWidth      =   6150
   ShowInTaskbar   =   0   'False
   StartUpPosition =   3  'Windows Default
   Begin VB.Image Image2 
      Height          =   480
      Left            =   2280
      MouseIcon       =   "frmCajas.frx":176BD
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":18387
      Top             =   6240
      Width           =   1620
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   5
      Left            =   3600
      MouseIcon       =   "frmCajas.frx":1CEC5
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":1DB8F
      Top             =   4200
      Width           =   1455
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   4
      Left            =   960
      MouseIcon       =   "frmCajas.frx":24782
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":2544C
      Top             =   4200
      Width           =   1455
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   3
      Left            =   3600
      MouseIcon       =   "frmCajas.frx":2C03F
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":2CD09
      Top             =   3000
      Width           =   1455
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   2
      Left            =   960
      MouseIcon       =   "frmCajas.frx":338FC
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":345C6
      Top             =   3000
      Width           =   1455
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   1
      Left            =   3600
      MouseIcon       =   "frmCajas.frx":3B1B9
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":3BE83
      Top             =   1680
      Width           =   1455
   End
   Begin VB.Image Image1 
      Height          =   1275
      Index           =   0
      Left            =   960
      MouseIcon       =   "frmCajas.frx":42A76
      MousePointer    =   99  'Custom
      Picture         =   "frmCajas.frx":43740
      Top             =   1680
      Width           =   1455
   End
End
Attribute VB_Name = "frmCajas"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Form_Load()

    Dim n As Byte

    For n = 0 To 3
        frmCajas.Image1(n).Picture = cLoadPicture(DirInterfaces & "baul2.jpg")
    Next

End Sub

Private Sub Image1_Click(Index As Integer)

    Dim index2 As Byte
    index2 = Index + 1
    SendData ("/BOVEDA" & index2)
    Unload Me

End Sub

Private Sub Image2_Click()

    Unload Me
    frmBanquero.Show vbModal

End Sub
