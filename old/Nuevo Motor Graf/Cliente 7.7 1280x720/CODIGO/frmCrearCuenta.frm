VERSION 5.00
Begin VB.Form frmCrearCuenta 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   0  'None
   ClientHeight    =   7185
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   6150
   ControlBox      =   0   'False
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   ScaleHeight     =   7185
   ScaleWidth      =   6150
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.TextBox Text2 
      BackColor       =   &H00000040&
      BorderStyle     =   0  'None
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   240
      TabIndex        =   4
      Top             =   2880
      Width           =   5655
   End
   Begin VB.TextBox Text1 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BorderStyle     =   0  'None
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H80000005&
      Height          =   375
      Left            =   240
      TabIndex        =   3
      Top             =   1800
      Width           =   5655
   End
   Begin VB.Label Label3 
      BackStyle       =   0  'Transparent
      Caption         =   "Contraseña (Solo letras y Numeros)"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   960
      TabIndex        =   5
      Top             =   2520
      Width           =   4095
   End
   Begin VB.Image Image2 
      Height          =   480
      Left            =   3360
      MouseIcon       =   "frmCrearCuenta.frx":0000
      MousePointer    =   99  'Custom
      Picture         =   "frmCrearCuenta.frx":0CCA
      Top             =   6240
      Width           =   1620
   End
   Begin VB.Image Image1 
      Height          =   480
      Left            =   840
      MouseIcon       =   "frmCrearCuenta.frx":5808
      MousePointer    =   99  'Custom
      Picture         =   "frmCrearCuenta.frx":64D2
      Top             =   6240
      Width           =   1620
   End
   Begin VB.Label Label4 
      BackColor       =   &H00C0E0FF&
      BackStyle       =   0  'Transparent
      Caption         =   "(Cuenta real)"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   3240
      TabIndex        =   2
      Top             =   1440
      Width           =   1695
   End
   Begin VB.Label Label2 
      BackColor       =   &H00C0E0FF&
      BackStyle       =   0  'Transparent
      Caption         =   "Correo electronico:"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Left            =   960
      TabIndex        =   1
      Top             =   1440
      Width           =   4215
   End
   Begin VB.Label Label1 
      BackColor       =   &H000000FF&
      BackStyle       =   0  'Transparent
      Caption         =   $"frmCrearCuenta.frx":9933
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
      Height          =   2055
      Left            =   360
      TabIndex        =   0
      Top             =   3600
      Width           =   5295
   End
End
Attribute VB_Name = "frmCrearCuenta"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Form_Load()

    frmCrearCuenta.Picture = cLoadPicture(DirInterfaces & "ventanas.jpg")

End Sub

Private Sub Image1_Click()

    If InStr(1, Text2, ",") Then
        MsgBox "Tu contraseña no puede contener una ',' (Coma).", vbCritical, "Error #85"
        Exit Sub

    End If

    'pluto:2.8.0
    If PideCuenta = True Then
        MsgBox "Ya has creado una Cuenta, debes reiniciar el juego para crear otra cuenta."

        'Exit Sub
    End If

    If Not CheckMailString(Text1) Then
        MsgBox "Direccion de mail invalida."
        Exit Sub

    End If

    'pluto:2.8.0
    PideCuenta = True
    'pluto:6.0A-------------------
    frmMain.Socket1.HostName = CurServerIp
    frmMain.Socket1.RemotePort = CurServerPort
    '---------------------------
    Call Audio.PlayWave("clave.wav")
    frmMain.Socket1.Connect

End Sub

Private Sub Image2_Click()

    frmCrearCuenta.Visible = False

End Sub

