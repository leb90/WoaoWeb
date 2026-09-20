VERSION 5.00
Begin VB.Form frmCanjes 
   BackColor       =   &H00000000&
   BorderStyle     =   0  'None
   Caption         =   "Sistema de Canjeo"
   ClientHeight    =   5175
   ClientLeft      =   420
   ClientTop       =   315
   ClientWidth     =   4785
   Icon            =   "Form1.frx":0000
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "Form1.frx":57E2
   ScaleHeight     =   5175
   ScaleWidth      =   4785
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.PictureBox Picture1 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   2800
      ScaleHeight     =   40
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   37
      TabIndex        =   9
      Top             =   790
      Width           =   555
   End
   Begin VB.TextBox lDescripcion 
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   855
      Left            =   2760
      MultiLine       =   -1  'True
      ScrollBars      =   2  'Vertical
      TabIndex        =   8
      Top             =   3010
      Width           =   1815
   End
   Begin VB.ListBox ListaPremios 
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   4155
      ItemData        =   "Form1.frx":10E2B
      Left            =   240
      List            =   "Form1.frx":10E2D
      TabIndex        =   0
      Top             =   240
      Width           =   2295
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
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   3540
      TabIndex        =   7
      Top             =   240
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
      ForeColor       =   &H00000040&
      Height          =   255
      Left            =   3000
      TabIndex        =   6
      Top             =   3960
      Visible         =   0   'False
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
      Left            =   3720
      TabIndex        =   5
      Top             =   1485
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
      Left            =   3720
      TabIndex        =   4
      Top             =   1890
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
      Left            =   3720
      TabIndex        =   3
      Top             =   2310
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
      Left            =   3720
      TabIndex        =   2
      Top             =   2685
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
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   3480
      TabIndex        =   1
      Top             =   1080
      Width           =   1005
   End
   Begin VB.Image bSalir 
      Height          =   570
      Left            =   2640
      Top             =   4440
      Width           =   1905
   End
   Begin VB.Image bAceptar 
      Height          =   555
      Left            =   480
      Top             =   4440
      Width           =   1875
   End
End
Attribute VB_Name = "frmCanjes"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private DrawObj As clsGraphicPicture

Public Sub DrawCanje(ByVal GrhIndex As Long)

    Set DrawObj = New clsGraphicPicture
    DrawObj.Initialize Picture1, GrhIndex, 0, 0
            
End Sub

Private Sub bAceptar_Click()

    Call SendData("SPX" & ListaPremios.ListIndex + 1)

End Sub

Private Sub ListaPremios_Click()

    Call SendData("IPX" & ListaPremios.ListIndex + 1)

End Sub

Private Sub bSalir_Click()

    DrawObj.Class_Terminate
    Set DrawObj = Nothing
    Unload Me

End Sub

Private Sub Form_Load()

    Call SendData("IPX" & ListaPremios.ListIndex + 1)

End Sub

