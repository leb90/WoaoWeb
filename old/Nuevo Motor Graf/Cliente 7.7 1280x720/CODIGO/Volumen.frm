VERSION 5.00
Object = "{831FDD16-0C5C-11D2-A9FC-0000F8754DA1}#2.2#0"; "MSCOMCTL.OCX"
Begin VB.Form Volumen 
   BorderStyle     =   0  'None
   ClientHeight    =   7200
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   6150
   LinkTopic       =   "Form4"
   Picture         =   "Volumen.frx":0000
   ScaleHeight     =   7200
   ScaleWidth      =   6150
   ShowInTaskbar   =   0   'False
   StartUpPosition =   3  'Windows Default
   Begin MSComctlLib.Slider Slider1 
      Height          =   495
      Index           =   0
      Left            =   1560
      TabIndex        =   0
      Top             =   2040
      Width           =   3015
      _ExtentX        =   5318
      _ExtentY        =   873
      _Version        =   393216
      BorderStyle     =   1
      Max             =   100
      TickStyle       =   3
   End
   Begin VB.CheckBox Check2 
      BackColor       =   &H00000040&
      Caption         =   "Doble-Clic Equipar Item."
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
      Height          =   255
      Index           =   1
      Left            =   1560
      MouseIcon       =   "Volumen.frx":96E7
      MousePointer    =   99  'Custom
      TabIndex        =   10
      Top             =   4800
      Width           =   3135
   End
   Begin VB.CheckBox Check2 
      BackColor       =   &H00000040&
      Caption         =   "Canales en GENERAL (CHATS)"
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
      Height          =   255
      Index           =   0
      Left            =   1560
      MouseIcon       =   "Volumen.frx":A3B1
      MousePointer    =   99  'Custom
      TabIndex        =   9
      Top             =   4800
      Visible         =   0   'False
      Width           =   3135
   End
   Begin VB.CheckBox Check1 
      BackColor       =   &H00000040&
      Caption         =   "Asistente "
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
      Height          =   255
      Index           =   2
      Left            =   3120
      MouseIcon       =   "Volumen.frx":B07B
      MousePointer    =   99  'Custom
      TabIndex        =   7
      Top             =   4080
      Width           =   1455
   End
   Begin VB.CheckBox Check1 
      BackColor       =   &H00000040&
      Caption         =   "Musica"
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
      Height          =   255
      Index           =   0
      Left            =   2280
      MouseIcon       =   "Volumen.frx":BD45
      MousePointer    =   99  'Custom
      TabIndex        =   2
      Top             =   2640
      Width           =   1455
   End
   Begin VB.CheckBox Check1 
      BackColor       =   &H00000040&
      Caption         =   "Sonidos"
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
      Height          =   255
      Index           =   1
      Left            =   1560
      MouseIcon       =   "Volumen.frx":CA0F
      MousePointer    =   99  'Custom
      TabIndex        =   1
      Top             =   4080
      Width           =   1455
   End
   Begin MSComctlLib.Slider Slider1 
      Height          =   495
      Index           =   1
      Left            =   1560
      TabIndex        =   3
      Top             =   3480
      Width           =   3015
      _ExtentX        =   5318
      _ExtentY        =   873
      _Version        =   393216
      BorderStyle     =   1
      LargeChange     =   10
      Max             =   100
      TickStyle       =   3
   End
   Begin VB.Label Label4 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Ajustes de Juego"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   14.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   1440
      TabIndex        =   8
      Top             =   4440
      Width           =   3375
   End
   Begin VB.Image Image1 
      Height          =   480
      Left            =   2280
      MouseIcon       =   "Volumen.frx":D6D9
      MousePointer    =   99  'Custom
      Picture         =   "Volumen.frx":E3A3
      Top             =   5760
      Width           =   1620
   End
   Begin VB.Label Label3 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Volumen de los Sonidos"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   375
      Left            =   1560
      TabIndex        =   6
      Top             =   3000
      Width           =   3015
   End
   Begin VB.Label Label2 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Volumen de la Música"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   375
      Left            =   1920
      TabIndex        =   5
      Top             =   1560
      Width           =   2415
   End
   Begin VB.Label Label1 
      BackStyle       =   0  'Transparent
      Caption         =   "Ajuste del Volumen"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   14.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   1560
      TabIndex        =   4
      Top             =   1200
      Width           =   3375
   End
End
Attribute VB_Name = "Volumen"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit


Private loading As Boolean

Private Sub Check1_Click(Index As Integer)

    If Not loading Then Call Audio.PlayWave(SND_CLICK)

    Select Case Index
    
    
        Case 0
            
            If Check1(0).value = vbUnchecked Then

                Audio.MusicMp3Activated = False
                Slider1(0).Enabled = False
            ElseIf Not Audio.MusicMp3Activated And Check1(0).value = vbChecked Then  'Prevent the music from reloading
            
                
                Audio.MusicMp3Activated = True
                Slider1(0).Enabled = True
                Slider1(0).value = Audio.MusicVolume
                Audio.MusicMP3VolumeSet (Slider1(0).value)
                

            End If
        
        Case 1

            If Check1(1).value = vbUnchecked Then
                Audio.SoundActivated = False
                'RainBufferIndex = 0
                IsPlaying = PlayLoop.plNone
                Slider1(1).Enabled = False
            Else
                Audio.SoundActivated = True
                Slider1(1).Enabled = True
                Slider1(1).value = Audio.SoundVolume

            End If

    End Select

End Sub

Private Sub Check2_Click(Index As Integer)

    Select Case Index

        Case 0

            If Volumen.Check2(0).value = 1 Then
                Chats = 1
                
                
                Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "Chat", 1)
            Else
                Chats = 0
                Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "Chat", 0)

            End If

        Case 1

            If Volumen.Check2(1).value = 1 Then
                DBe = 1
                Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2", 1)
            Else
                DBe = 0
                Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2", 0)

            End If

    End Select

End Sub

Private Sub Form_Load()

    loading = True      'Prevent sounds when setting check's values

    If Audio.MusicMp3Activated Then
        Check1(0).value = vbChecked
        Slider1(0).Enabled = True
        Slider1(0).value = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "nivelvolumenmusica")) 'Audio.MusicVolume
    Else
        Check1(0).value = vbUnchecked
        Slider1(0).Enabled = False

    End If
    
    If Audio.SoundActivated Then
        Check1(1).value = vbChecked
        Slider1(1).Enabled = True
        Slider1(1).value = Audio.SoundVolume

        'pluto:6.0A
        If Fasis > 0 Then Check1(2).value = vbChecked Else Check1(2).value = vbUnchecked
    Else
        Check1(1).value = vbUnchecked
        Slider1(1).Enabled = False

    End If
    
    loading = False
   
    Chats = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "Chat"))
    DBe = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2"))
    Volumen.Check2(0).value = Chats
    Volumen.Check2(1).value = DBe

End Sub

Private Sub Image1_Click()

    If Volumen.Check1(0).value = 1 Then
        Musi = 1
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "musica", 1)
    Else
        Musi = 0
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "musica", 0)

    End If

    If Volumen.Check1(1).value = 1 Then
        Son = 1
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "sonido", 1)
    Else
        Son = 0
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "sonido", 0)

    End If

    If Volumen.Check1(2).value = 1 Then
        Fasis = 1
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "asistente", 1)
    Else
        Fasis = 0
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "asistente", 0)

    End If

    If Volumen.Check2(0).value = 1 Then
        Chats = 1
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "Chat", 1)
    Else
        Chats = 0
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "Chat", 0)

    End If

    If Volumen.Check2(1).value = 1 Then
        DBe = 1
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2", 1)
    Else
        DBe = 0
        Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2", 0)

    End If
    
    Call WriteVar(DirInit & "opciones.dat", "OPCIONES", "nivelvolumenmusica", Audio.MusicVolume)
    'Call Audio.MusicMP3GetLoop

    Unload Me

End Sub

Private Sub Slider1_Change(Index As Integer)

    Select Case Index

        Case 0
            Audio.MusicVolume = Slider1(0).value
            Audio.MusicMP3VolumeSet (Slider1(0).value)
        Case 1
            Audio.SoundVolume = Slider1(1).value

    End Select

End Sub

Private Sub Slider1_Scroll(Index As Integer)

    Select Case Index

        Case 0
            
            Audio.MusicVolume = Slider1(0).value
            Audio.MusicMP3VolumeSet (Slider1(0).value)

        Case 1
            Audio.SoundVolume = Slider1(1).value

    End Select

End Sub

