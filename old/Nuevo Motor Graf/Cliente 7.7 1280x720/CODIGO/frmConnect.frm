VERSION 5.00
Begin VB.Form frmConnect 
   BackColor       =   &H00E0E0E0&
   BorderStyle     =   0  'None
   Caption         =   "Cliente AoDraG"
   ClientHeight    =   9000
   ClientLeft      =   0
   ClientTop       =   -255
   ClientWidth     =   12000
   ClipControls    =   0   'False
   FillColor       =   &H00000040&
   ForeColor       =   &H00000000&
   Icon            =   "frmConnect.frx":0000
   KeyPreview      =   -1  'True
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Moveable        =   0   'False
   Picture         =   "frmConnect.frx":000C
   ScaleHeight     =   600
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   800
   StartUpPosition =   2  'CenterScreen
   Visible         =   0   'False
   Begin VB.TextBox passwordtxt 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BorderStyle     =   0  'None
      BeginProperty Font 
         Name            =   "Comic Sans MS"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   345
      IMEMode         =   3  'DISABLE
      Left            =   4095
      MouseIcon       =   "frmConnect.frx":3E4C0
      MousePointer    =   99  'Custom
      PasswordChar    =   "*"
      TabIndex        =   4
      Top             =   5910
      Width           =   3120
   End
   Begin VB.TextBox nametxt 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BorderStyle     =   0  'None
      BeginProperty Font 
         Name            =   "Comic Sans MS"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   4080
      MouseIcon       =   "frmConnect.frx":3F18A
      MousePointer    =   99  'Custom
      TabIndex        =   3
      Top             =   4980
      Width           =   3135
   End
   Begin VB.Label Label6 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00008080&
      BackStyle       =   0  'Transparent
      Caption         =   "La guerra por los Castillos"
      BeginProperty Font 
         Name            =   "Comic Sans MS"
         Size            =   9
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Left            =   3120
      TabIndex        =   5
      Top             =   8520
      Visible         =   0   'False
      Width           =   5055
   End
   Begin VB.Image salir 
      Height          =   615
      Left            =   3480
      Top             =   6480
      Width           =   2055
   End
   Begin VB.Label Label7 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H0000FFFF&
      Height          =   855
      Left            =   4200
      TabIndex        =   2
      Top             =   2880
      Width           =   3735
   End
   Begin VB.Label Label5 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00800000&
      BackStyle       =   0  'Transparent
      Caption         =   "Versión Beta"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   4680
      MouseIcon       =   "frmConnect.frx":3FE54
      MousePointer    =   99  'Custom
      TabIndex        =   1
      Top             =   120
      Visible         =   0   'False
      Width           =   2535
   End
   Begin VB.Label dragcreditos 
      BackStyle       =   0  'Transparent
      Height          =   615
      Left            =   9840
      MouseIcon       =   "frmConnect.frx":40B1E
      MousePointer    =   99  'Custom
      TabIndex        =   0
      Top             =   8040
      Width           =   2055
   End
   Begin VB.Image Image2 
      Height          =   570
      Left            =   9720
      MouseIcon       =   "frmConnect.frx":417E8
      MousePointer    =   99  'Custom
      Top             =   8160
      Width           =   2145
   End
   Begin VB.Image Image1 
      Height          =   645
      Index           =   0
      Left            =   9720
      MouseIcon       =   "frmConnect.frx":424B2
      MousePointer    =   99  'Custom
      Top             =   7440
      Width           =   2130
   End
   Begin VB.Image Image1 
      Height          =   615
      Index           =   1
      Left            =   5760
      MouseIcon       =   "frmConnect.frx":4317C
      MousePointer    =   99  'Custom
      Top             =   6480
      Width           =   2115
   End
   Begin VB.Image Image1 
      Height          =   1320
      Index           =   2
      Left            =   4200
      MouseIcon       =   "frmConnect.frx":43E46
      MousePointer    =   99  'Custom
      Top             =   1320
      Width           =   3720
   End
End
Attribute VB_Name = "frmConnect"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub Form_KeyDown(KeyCode As Integer, Shift As Integer)

    If KeyCode = 27 Then
        prgRun = False
    End If

    'pluto:7.0
    If KeyCode = 13 Then Image1_Click (1)

End Sub

Private Sub Form_KeyUp(KeyCode As Integer, Shift As Integer)

    If KeyCode = vbKeyI And Shift = vbCtrlMask Then
        KeyCode = 0
        Exit Sub

    End If

End Sub

Private Sub Form_Load()

    frmConnect.Label7.Visible = False
    EngineRun = False

    If GetSetting("AODRAG", "SERVIDOR", "ANUNCIO", 0) = 0 Then
        MsgBox "¡¡¡¡ATENCIÓN!!!! World Of AO ya esta revolucionando el mundo de Argentum.", vbExclamation
        SaveSetting "AODRAG", "SERVIDOR", "ANUNCIO", 1

    End If

    '-------------------------
End Sub

Private Sub Image1_Click(Index As Integer)

    Call Audio.PlayWave(SND_CLICK)
    frmConnect.Label7.Visible = False
    
    Select Case Index

        Case 0
            'Call Audio.PlayMIDI("7.mid", 1)
            Call Audio.MusicMP3Play(App.Path & "\Recursos\MP3\" & "7.mp3") 'Play Mp3
            frmCrearCuenta.Show vbModal

        Case 1
            frmMain.Socket1.Disconnect

            Dim aveces As Byte
            aveces = Val(Right$(Time, 2))
            Call Audio.PlayWave(SND_CLICK)

            'pluto:2.5.0
            If frmMain.Socket1.Connected Then
                Call frmMain.Socket1.Disconnect
            End If
   
            KeyCodi = ""
            Keycodi2 = ""
            UserName = nametxt.Text
            frmCuentas.Label1(1).Caption = LCase$(UserName)
     
            Dim aux As String
            aux = passwordtxt.Text
            UserPassword = MD5String(aux)

            If CheckUserData(False) = True Then

                frmMain.Socket1.HostName = CurServerIp
                frmMain.Socket1.RemotePort = CurServerPort
                SendNewChar = False
                Me.MousePointer = 11
                frmMain.Socket1.Connect

            End If

    End Select

End Sub

Private Sub Image2_Click()

    frmRecuperarCuenta.Show vbModal

End Sub

Private Sub opciones_Click()

    frmOpciones.Show

End Sub

Private Sub salir_Click()
   
    prgRun = False

End Sub

