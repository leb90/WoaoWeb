VERSION 5.00
Begin VB.Form frmMontura 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   0  'None
   ClientHeight    =   7185
   ClientLeft      =   3000
   ClientTop       =   675
   ClientWidth     =   6165
   ControlBox      =   0   'False
   FillColor       =   &H00808000&
   LinkTopic       =   "Monturas"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   ScaleHeight     =   7185
   ScaleWidth      =   6165
   ShowInTaskbar   =   0   'False
   StartUpPosition =   1  'CenterOwner
   Begin VB.PictureBox Picture12 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   4080
      MouseIcon       =   "frmMontura.frx":0000
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   24
      Top             =   3960
      Width           =   510
   End
   Begin VB.PictureBox Picture11 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   4080
      MouseIcon       =   "frmMontura.frx":0CCA
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   23
      Top             =   3240
      Width           =   510
   End
   Begin VB.PictureBox Picture10 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   4080
      MouseIcon       =   "frmMontura.frx":1994
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   22
      Top             =   2520
      Width           =   510
   End
   Begin VB.PictureBox Picture9 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   4080
      MouseIcon       =   "frmMontura.frx":265E
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   21
      Top             =   1800
      Width           =   510
   End
   Begin VB.PictureBox Picture8 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   2280
      MouseIcon       =   "frmMontura.frx":3328
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   20
      Top             =   3960
      Width           =   510
   End
   Begin VB.PictureBox Picture7 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   2280
      MouseIcon       =   "frmMontura.frx":3FF2
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   19
      Top             =   3240
      Width           =   510
   End
   Begin VB.PictureBox Picture6 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   2280
      MouseIcon       =   "frmMontura.frx":4CBC
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   18
      Top             =   2520
      Width           =   510
   End
   Begin VB.PictureBox Picture5 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   2280
      MouseIcon       =   "frmMontura.frx":5986
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   17
      Top             =   1800
      Width           =   510
   End
   Begin VB.PictureBox Picture4 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   480
      MouseIcon       =   "frmMontura.frx":6650
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   16
      Top             =   3960
      Width           =   510
   End
   Begin VB.PictureBox Picture3 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   480
      MouseIcon       =   "frmMontura.frx":731A
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   15
      Top             =   3240
      Width           =   510
   End
   Begin VB.PictureBox Picture2 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   480
      MouseIcon       =   "frmMontura.frx":7FE4
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   14
      Top             =   2520
      Width           =   510
   End
   Begin VB.PictureBox Picture1 
      Appearance      =   0  'Flat
      AutoRedraw      =   -1  'True
      AutoSize        =   -1  'True
      BackColor       =   &H000000FF&
      FillStyle       =   0  'Solid
      ForeColor       =   &H80000008&
      Height          =   510
      Left            =   480
      MouseIcon       =   "frmMontura.frx":8CAE
      MousePointer    =   99  'Custom
      ScaleHeight     =   480
      ScaleWidth      =   480
      TabIndex        =   2
      Top             =   1800
      Width           =   510
   End
   Begin VB.Image Image1 
      Height          =   480
      Left            =   2280
      MouseIcon       =   "frmMontura.frx":9978
      MousePointer    =   99  'Custom
      Picture         =   "frmMontura.frx":A642
      Top             =   6360
      Width           =   1620
   End
   Begin VB.Label Label12 
      BackStyle       =   0  'Transparent
      Caption         =   "Avestruz"
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
      Left            =   4680
      TabIndex        =   13
      Top             =   4080
      Width           =   1335
   End
   Begin VB.Label Label11 
      BackStyle       =   0  'Transparent
      Caption         =   "Wyvern"
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
      Left            =   4680
      TabIndex        =   12
      Top             =   3360
      Width           =   1335
   End
   Begin VB.Label Label10 
      BackStyle       =   0  'Transparent
      Caption         =   "Cerbero"
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
      Left            =   4680
      TabIndex        =   11
      Top             =   2640
      Width           =   1335
   End
   Begin VB.Label Label9 
      BackStyle       =   0  'Transparent
      Caption         =   "Rinosaurio"
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
      Left            =   4680
      TabIndex        =   10
      Top             =   1920
      Width           =   1335
   End
   Begin VB.Label Label8 
      BackStyle       =   0  'Transparent
      Caption         =   "Hipogrifo"
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
      Left            =   2880
      TabIndex        =   9
      Top             =   4080
      Width           =   1215
   End
   Begin VB.Label Label7 
      BackStyle       =   0  'Transparent
      Caption         =   "Kong"
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
      Left            =   2880
      TabIndex        =   8
      Top             =   3360
      Width           =   1095
   End
   Begin VB.Label Label6 
      BackStyle       =   0  'Transparent
      Caption         =   "Jabato"
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
      Left            =   2880
      TabIndex        =   7
      Top             =   2640
      Width           =   1095
   End
   Begin VB.Label Label5 
      BackStyle       =   0  'Transparent
      Caption         =   "Dragón"
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
      Left            =   2880
      TabIndex        =   6
      Top             =   1920
      Width           =   1095
   End
   Begin VB.Label Label4 
      BackStyle       =   0  'Transparent
      Caption         =   "Elefante"
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
      Left            =   1080
      TabIndex        =   5
      Top             =   4080
      Width           =   1095
   End
   Begin VB.Label Label3 
      BackStyle       =   0  'Transparent
      Caption         =   "Tigre"
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
      Left            =   1080
      TabIndex        =   4
      Top             =   3360
      Width           =   1095
   End
   Begin VB.Label Label2 
      BackStyle       =   0  'Transparent
      Caption         =   "Caballo"
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
      Left            =   1080
      TabIndex        =   3
      Top             =   2640
      Width           =   1095
   End
   Begin VB.Label Label1 
      BackStyle       =   0  'Transparent
      Caption         =   "Unicornio"
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
      Left            =   1080
      TabIndex        =   1
      Top             =   1920
      Width           =   1095
   End
   Begin VB.Label Label13 
      Alignment       =   2  'Center
      BackColor       =   &H0000FFFF&
      BackStyle       =   0  'Transparent
      Caption         =   "Pulsa sobre la imagen de una Mascota para ver sus características."
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   12
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   855
      Left            =   960
      TabIndex        =   0
      Top             =   4920
      Width           =   4335
   End
End
Attribute VB_Name = "frmMontura"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Dim n             As Byte

Private DrawObj1  As clsGraphicPicture
Private DrawObj2  As clsGraphicPicture
Private DrawObj3  As clsGraphicPicture
Private DrawObj4  As clsGraphicPicture
Private DrawObj5  As clsGraphicPicture
Private DrawObj6  As clsGraphicPicture
Private DrawObj7  As clsGraphicPicture
Private DrawObj8  As clsGraphicPicture
Private DrawObj9  As clsGraphicPicture
Private DrawObj10 As clsGraphicPicture
Private DrawObj11 As clsGraphicPicture
Private DrawObj12 As clsGraphicPicture

Private Sub Form_Load()

    'Cargamos la interfase
    SELECI = 0
    frmMontura.Picture = cLoadPicture(DirInterfaces & "mascotas2.jpg")

    Set DrawObj1 = New clsGraphicPicture
    Set DrawObj2 = New clsGraphicPicture
    Set DrawObj3 = New clsGraphicPicture
    Set DrawObj4 = New clsGraphicPicture
    Set DrawObj5 = New clsGraphicPicture
    Set DrawObj6 = New clsGraphicPicture
    Set DrawObj7 = New clsGraphicPicture
    Set DrawObj8 = New clsGraphicPicture
    Set DrawObj9 = New clsGraphicPicture
    Set DrawObj10 = New clsGraphicPicture
    Set DrawObj11 = New clsGraphicPicture
    Set DrawObj12 = New clsGraphicPicture

    Call DrawObj1.Initialize(Picture1, 17800, 0, 0)
    Call DrawObj2.Initialize(Picture2, 18495, 0, 0)
    Call DrawObj3.Initialize(Picture3, 18496, 0, 0)
    Call DrawObj4.Initialize(Picture4, 18497, 0, 0)
    Call DrawObj5.Initialize(Picture5, 18718, 0, 0)
    Call DrawObj6.Initialize(Picture6, 26936, 0, 0)
    Call DrawObj7.Initialize(Picture7, 26940, 0, 0)
    Call DrawObj8.Initialize(Picture8, 3809, 0, 0)
    Call DrawObj9.Initialize(Picture9, 65, 0, 0)
    Call DrawObj10.Initialize(Picture10, 67, 0, 0)
    Call DrawObj11.Initialize(Picture11, 66, 0, 0)
    Call DrawObj12.Initialize(Picture12, 26942, 0, 0)

End Sub

Private Sub Form_Unload(Cancel As Integer)

    DrawObj1.Class_Terminate
    DrawObj2.Class_Terminate
    DrawObj3.Class_Terminate
    DrawObj4.Class_Terminate
    DrawObj5.Class_Terminate
    DrawObj6.Class_Terminate
    DrawObj7.Class_Terminate
    DrawObj8.Class_Terminate
    DrawObj9.Class_Terminate
    DrawObj10.Class_Terminate
    DrawObj11.Class_Terminate
    DrawObj12.Class_Terminate
    
    Set DrawObj1 = Nothing
    Set DrawObj2 = Nothing
    Set DrawObj3 = Nothing
    Set DrawObj4 = Nothing
    Set DrawObj5 = Nothing
    Set DrawObj6 = Nothing
    Set DrawObj7 = Nothing
    Set DrawObj8 = Nothing
    Set DrawObj9 = Nothing
    Set DrawObj10 = Nothing
    Set DrawObj11 = Nothing
    Set DrawObj12 = Nothing

End Sub

Private Sub Image1_Click()

    Unload Me

End Sub

Private Sub picture1_Click()

    SendData "KON1"
    SELECI = 1
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture1_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture1.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture10_Click()

    SendData "KON10"
    SELECI = 10
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture10_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture10.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture11_Click()

    SendData "KON11"
    SELECI = 11
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture11_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture11.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture12_Click()

    SendData "KON12"
    SELECI = 12
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture12_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture12.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture1.BorderStyle = 1

End Sub

Private Sub picture2_Click()

    SendData "KON2"
    SELECI = 2
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture2_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture2.BorderStyle = 0
    Picture1.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture3_Click()

    SendData "KON3"
    SELECI = 3
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture3_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture3.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture4_Click()

    SendData "KON4"
    SELECI = 4
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture4_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture4.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture5_Click()

    SendData "KON5"
    SELECI = 5
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Label16_Click()

End Sub

Private Sub Picture5_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture5.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture6_Click()

    SendData "KON6"
    SELECI = 6
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture6_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture6.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture7_Click()

    SendData "KON7"
    SELECI = 7
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture7_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture7.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture8_Click()

    SendData "KON8"
    SELECI = 8
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture8_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture8.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture9.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

Private Sub picture9_Click()

    SendData "KON9"
    SELECI = 9
    Call Audio.PlayWave(SND_CLICK)
    Unload Me

End Sub

Private Sub Picture9_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    Picture9.BorderStyle = 0
    Picture2.BorderStyle = 1
    Picture3.BorderStyle = 1
    Picture4.BorderStyle = 1
    Picture5.BorderStyle = 1
    Picture6.BorderStyle = 1
    Picture7.BorderStyle = 1
    Picture8.BorderStyle = 1
    Picture1.BorderStyle = 1
    Picture10.BorderStyle = 1
    Picture11.BorderStyle = 1
    Picture12.BorderStyle = 1

End Sub

