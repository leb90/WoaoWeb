VERSION 5.00
Begin VB.Form frmDonaciones 
   BackColor       =   &H00000000&
   BorderStyle     =   0  'None
   Caption         =   "Sistema de Canjeo"
   ClientHeight    =   7605
   ClientLeft      =   420
   ClientTop       =   315
   ClientWidth     =   9360
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "Form12.frx":0000
   ScaleHeight     =   7605
   ScaleWidth      =   9360
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.PictureBox Picture1 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   7910
      ScaleHeight     =   600
      ScaleWidth      =   555
      TabIndex        =   9
      Top             =   720
      Width           =   555
   End
   Begin VB.TextBox lDescripcion 
      BackColor       =   &H00000000&
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   2055
      Left            =   4640
      MultiLine       =   -1  'True
      TabIndex        =   8
      Top             =   1680
      Width           =   4095
   End
   Begin VB.ListBox ListaPremios 
      BackColor       =   &H00000000&
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   4740
      Left            =   960
      TabIndex        =   0
      Top             =   1285
      Width           =   3375
   End
   Begin VB.Image donar 
      Height          =   615
      Left            =   840
      Top             =   6240
      Width           =   1935
   End
   Begin VB.Image lFoto 
      Height          =   2175
      Left            =   4640
      Top             =   3960
      Width           =   4095
   End
   Begin VB.Label lPuntos 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "99999"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   3000
      TabIndex        =   7
      Top             =   6440
      Width           =   1005
   End
   Begin VB.Label lCantidad 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "1"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   6240
      TabIndex        =   6
      Top             =   840
      Width           =   855
   End
   Begin VB.Label lAtaque 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "100/100"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   5400
      TabIndex        =   5
      Top             =   6360
      Width           =   855
   End
   Begin VB.Label lDef 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "100/100"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   5400
      TabIndex        =   4
      Top             =   6920
      Width           =   855
   End
   Begin VB.Label lAM 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "100/100"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   7920
      TabIndex        =   3
      Top             =   6360
      Width           =   855
   End
   Begin VB.Label lDM 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "100/100"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   7920
      TabIndex        =   2
      Top             =   6930
      Width           =   855
   End
   Begin VB.Label Requiere 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "99999"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   6120
      TabIndex        =   1
      Top             =   1150
      Width           =   1005
   End
   Begin VB.Image bSalir 
      Height          =   450
      Left            =   8640
      Top             =   240
      Width           =   360
   End
   Begin VB.Image bAceptar 
      Height          =   555
      Left            =   1440
      Top             =   6840
      Width           =   2355
   End
End
Attribute VB_Name = "frmDonaciones"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private DrawObj As clsGraphicPicture

Public Sub DrawDonacion(ByVal GrhIndex As Long)

    Set DrawObj = New clsGraphicPicture
    DrawObj.Initialize Picture1, GrhIndex, 0, 0
            
End Sub

Private Sub bAceptar_Click()

    Call SendData("EPX" & ListaPremios.ListIndex + 1)

End Sub
     
Private Sub donar_Click()

    Dim variable As String
    Dim ie       As Object
    variable = "http://worldofao.online/Donaciones/"

    Set ie = CreateObject("InternetExplorer.Application")
    ie.Visible = True
    ie.Navigate variable
    Call AddtoRichTextBox(frmMain.RecTxt, "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, _
            True, False, False)

End Sub

Private Sub ListaPremios_Click()

    Call SendData("DPX" & ListaPremios.ListIndex + 1)

End Sub

Private Sub bSalir_Click()
 
    DrawObj.Class_Terminate
    Set DrawObj = Nothing

    Unload Me

End Sub

Private Sub Form_Load()

    Call SendData("DPX" & ListaPremios.ListIndex + 1)

    'bAceptar.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BcanjearN.jpg")
    'bSalir.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BsalirN.jpg")
    'Me.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_main.jpg")
End Sub

Private Sub baceptar_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)

    'bAceptar.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BcanjearA.jpg")
End Sub

Private Sub baceptar_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    'bAceptar.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BcanjearI.jpg")
End Sub

Private Sub bsalir_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)

    'bSalir.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BsalirA.jpg")
End Sub

Private Sub bsalir_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    'bSalir.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BsalirI.jpg")
End Sub

Private Sub Form_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    'bSalir.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BsalirN.jpg")
    'bAceptar.Picture = cLoadPicture(DirInterfaces & "Principal\Canjear_BcanjearN.jpg")
End Sub
