VERSION 5.00
Begin VB.Form frmSkills3 
   BackColor       =   &H00C0E0FF&
   BorderStyle     =   0  'None
   Caption         =   "Form1"
   ClientHeight    =   7155
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   9765
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   MouseIcon       =   "frmSkills3.frx":0000
   MousePointer    =   99  'Custom
   Picture         =   "frmSkills3.frx":0CCA
   ScaleHeight     =   7155
   ScaleWidth      =   9765
   ShowInTaskbar   =   0   'False
   StartUpPosition =   1  'CenterOwner
   Begin VB.Image Image6 
      Height          =   300
      Left            =   1560
      Picture         =   "frmSkills3.frx":378B8
      Top             =   2880
      Width           =   1770
   End
   Begin VB.Image Image5 
      Height          =   300
      Left            =   4080
      Picture         =   "frmSkills3.frx":3C9EC
      Top             =   4440
      Width           =   2625
   End
   Begin VB.Image Image4 
      Height          =   300
      Left            =   4680
      Picture         =   "frmSkills3.frx":422F8
      Top             =   2880
      Width           =   1650
   End
   Begin VB.Image Image3 
      Height          =   300
      Left            =   4440
      Picture         =   "frmSkills3.frx":472CA
      Top             =   1200
      Width           =   2025
   End
   Begin VB.Image Image2 
      Height          =   300
      Left            =   1320
      Picture         =   "frmSkills3.frx":4C7C2
      Top             =   1200
      Width           =   2340
   End
   Begin VB.Image Image1 
      Height          =   300
      Left            =   7200
      MouseIcon       =   "frmSkills3.frx":521E7
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":52EB1
      Top             =   6600
      Width           =   1650
   End
   Begin VB.Label Label6 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00008080&
      BackStyle       =   0  'Transparent
      Caption         =   "Habilidades del Personaje"
      BeginProperty Font 
         Name            =   "Comic Sans MS"
         Size            =   12
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   360
      TabIndex        =   56
      Top             =   360
      Width           =   3615
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Navegar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   28
      Left            =   7200
      TabIndex        =   55
      Top             =   4920
      Width           =   975
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Domar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   27
      Left            =   4440
      TabIndex        =   54
      Top             =   6360
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Liderazgo"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   26
      Left            =   4440
      TabIndex        =   53
      Top             =   6000
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Herreria"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   25
      Left            =   4440
      TabIndex        =   52
      Top             =   5640
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Carpinteria"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   24
      Left            =   4200
      TabIndex        =   51
      Top             =   5280
      Width           =   1335
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Mineria"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   23
      Left            =   4560
      TabIndex        =   50
      Top             =   4920
      Width           =   855
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Pescar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   22
      Left            =   7200
      TabIndex        =   49
      Top             =   5280
      Width           =   855
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Comercio"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   21
      Left            =   7320
      TabIndex        =   48
      Top             =   5640
      Width           =   855
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Talar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   20
      Left            =   1320
      TabIndex        =   47
      Top             =   6360
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Supervivivencia"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   19
      Left            =   720
      TabIndex        =   46
      Top             =   6000
      Width           =   1695
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Ocultarse"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   18
      Left            =   1320
      TabIndex        =   45
      Top             =   5640
      Width           =   975
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Robar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   17
      Left            =   1320
      TabIndex        =   44
      Top             =   5280
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Suerte"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   16
      Left            =   1320
      TabIndex        =   43
      Top             =   4920
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Apuñalar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   14
      Left            =   4080
      TabIndex        =   42
      Top             =   4080
      Width           =   1335
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Defensa Escudos"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   13
      Left            =   3840
      TabIndex        =   41
      Top             =   3720
      Width           =   1695
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Armas Dobles"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   12
      Left            =   4080
      TabIndex        =   40
      Top             =   3360
      Width           =   1455
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Meditar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   10
      Left            =   1200
      TabIndex        =   39
      Top             =   3720
      Width           =   975
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Aprendizaje"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   9
      Left            =   1080
      TabIndex        =   38
      Top             =   3360
      Width           =   1215
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   28
      Left            =   2520
      TabIndex        =   37
      Top             =   360
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   30
      Left            =   2685
      TabIndex        =   36
      Top             =   1725
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   25
      Left            =   3255
      TabIndex        =   35
      Top             =   405
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   26
      Left            =   3120
      TabIndex        =   34
      Top             =   165
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   29
      Left            =   2295
      TabIndex        =   33
      Top             =   165
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   48
      Left            =   3600
      MouseIcon       =   "frmSkills3.frx":57BCE
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   49
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":58898
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   50
      Left            =   3435
      MouseIcon       =   "frmSkills3.frx":59562
      MousePointer    =   99  'Custom
      Top             =   195
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   51
      Left            =   3000
      MouseIcon       =   "frmSkills3.frx":5A22C
      MousePointer    =   99  'Custom
      Top             =   120
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   54
      Left            =   2760
      MouseIcon       =   "frmSkills3.frx":5AEF6
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   55
      Left            =   2280
      MouseIcon       =   "frmSkills3.frx":5BBC0
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   56
      Left            =   2595
      MouseIcon       =   "frmSkills3.frx":5C88A
      MousePointer    =   99  'Custom
      Top             =   120
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   57
      Left            =   2160
      MouseIcon       =   "frmSkills3.frx":5D554
      MousePointer    =   99  'Custom
      Top             =   120
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Esquivar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   6
      Left            =   4200
      TabIndex        =   32
      Top             =   2400
      Width           =   1455
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Destreza"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   5
      Left            =   4200
      TabIndex        =   31
      Top             =   2040
      Width           =   1455
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Aprendizaje"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   4
      Left            =   4200
      TabIndex        =   30
      Top             =   1680
      Width           =   1335
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Esquivar"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   2
      Left            =   1080
      TabIndex        =   29
      Top             =   2400
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Puntería"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   1
      Left            =   1080
      TabIndex        =   28
      Top             =   2040
      Width           =   1095
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "Aprendizaje"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFFF&
      Height          =   255
      Index           =   0
      Left            =   1080
      TabIndex        =   27
      Top             =   1680
      Width           =   1215
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   31
      Left            =   2685
      TabIndex        =   26
      Top             =   2475
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   61
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":5E21E
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":5EEE8
      Top             =   2400
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   60
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":62FD5
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":63C9F
      Top             =   2400
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   59
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":67DBD
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":68A87
      Top             =   1680
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   58
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":6CB74
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":6D83E
      Top             =   1680
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   53
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":7195C
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":72626
      Top             =   1680
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   52
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":76713
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":773DD
      Top             =   1680
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   47
      Left            =   1440
      MouseIcon       =   "frmSkills3.frx":7B4FB
      MousePointer    =   99  'Custom
      Top             =   120
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   46
      Left            =   1920
      MouseIcon       =   "frmSkills3.frx":7C1C5
      MousePointer    =   99  'Custom
      Top             =   120
      Visible         =   0   'False
      Width           =   225
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   45
      Left            =   1440
      MouseIcon       =   "frmSkills3.frx":7CE8F
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   105
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   44
      Left            =   1875
      MouseIcon       =   "frmSkills3.frx":7DB59
      MousePointer    =   99  'Custom
      Top             =   360
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Image command1 
      Height          =   285
      Index           =   43
      Left            =   1560
      MouseIcon       =   "frmSkills3.frx":7E823
      MousePointer    =   99  'Custom
      Top             =   480
      Visible         =   0   'False
      Width           =   105
   End
   Begin VB.Image command1 
      Height          =   165
      Index           =   42
      Left            =   1980
      MouseIcon       =   "frmSkills3.frx":7F4ED
      MousePointer    =   99  'Custom
      Top             =   555
      Visible         =   0   'False
      Width           =   195
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   27
      Left            =   5880
      TabIndex        =   25
      Top             =   1740
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   24
      Left            =   1560
      TabIndex        =   24
      Top             =   90
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   23
      Left            =   1560
      TabIndex        =   23
      Top             =   315
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   22
      Left            =   1680
      TabIndex        =   22
      Top             =   540
      Visible         =   0   'False
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   1
      Left            =   2715
      TabIndex        =   21
      Top             =   4965
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   2
      Left            =   2685
      TabIndex        =   20
      Top             =   3435
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   3
      Left            =   2715
      TabIndex        =   19
      Top             =   5310
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   4
      Left            =   5880
      TabIndex        =   18
      Top             =   2460
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   5
      Left            =   5880
      TabIndex        =   17
      Top             =   2100
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   6
      Left            =   2685
      TabIndex        =   16
      Top             =   3795
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   7
      Left            =   5880
      TabIndex        =   15
      Top             =   4125
      Width           =   285
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   8
      Left            =   2715
      TabIndex        =   14
      Top             =   5685
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   9
      Left            =   2715
      TabIndex        =   13
      Top             =   6045
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   10
      Left            =   2715
      TabIndex        =   12
      Top             =   6405
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   210
      Index           =   11
      Left            =   8595
      TabIndex        =   11
      Top             =   5685
      Width           =   405
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   12
      Left            =   5880
      TabIndex        =   10
      Top             =   3780
      Width           =   285
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   0
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":801B7
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":80E81
      Top             =   4920
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   2
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":84F9F
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":85C69
      Top             =   3405
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   3
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":89D87
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":8AA51
      Top             =   3390
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   4
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":8EB3E
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":8F808
      Top             =   5280
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   5
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":93926
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":945F0
      Top             =   5280
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   6
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":986DD
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":993A7
      Top             =   2400
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   7
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":9D4C5
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":9E18F
      Top             =   2400
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   8
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":A227C
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":A2F46
      Top             =   2040
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   9
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":A7064
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":A7D2E
      Top             =   2040
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   10
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":ABE1B
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":ACAE5
      Top             =   3720
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   11
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":B0C03
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":B18CD
      Top             =   3735
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   12
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":B59BA
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":B6684
      Top             =   4080
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   13
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":BA7A2
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":BB46C
      Top             =   4080
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   14
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":BF559
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":C0223
      Top             =   5640
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   15
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":C4341
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":C500B
      Top             =   5640
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   16
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":C90F8
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":C9DC2
      Top             =   6000
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   17
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":CDEE0
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":CEBAA
      Top             =   6000
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   18
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":D2C97
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":D3961
      Top             =   6360
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   19
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":D7A7F
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":D8749
      Top             =   6360
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   20
      Left            =   9000
      MouseIcon       =   "frmSkills3.frx":DC836
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":DD500
      Top             =   5640
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   21
      Left            =   8280
      MouseIcon       =   "frmSkills3.frx":E161E
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":E22E8
      Top             =   5640
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   22
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":E63D5
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":E709F
      Top             =   3720
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   23
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":EB1BD
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":EBE87
      Top             =   3720
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   24
      Left            =   9000
      MouseIcon       =   "frmSkills3.frx":EFF74
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":F0C3E
      Top             =   5280
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   25
      Left            =   8280
      MouseIcon       =   "frmSkills3.frx":F4D5C
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":F5A26
      Top             =   5280
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   13
      Left            =   8595
      TabIndex        =   9
      Top             =   5280
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   26
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":F9B13
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":FA7DD
      Top             =   4920
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   27
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":FE8FB
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":FF5C5
      Top             =   4905
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   14
      Left            =   5835
      TabIndex        =   8
      Top             =   4965
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   28
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":1036B2
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":10437C
      Top             =   5280
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   29
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":10849A
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":109164
      Top             =   5280
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   15
      Left            =   5835
      TabIndex        =   7
      Top             =   5280
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   30
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":10D251
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":10DF1B
      Top             =   5640
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   31
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":112039
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":112D03
      Top             =   5640
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   16
      Left            =   5835
      TabIndex        =   6
      Top             =   5685
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   32
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":116DF0
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":117ABA
      Top             =   6000
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   33
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":11BBD8
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":11C8A2
      Top             =   6000
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   17
      Left            =   5835
      TabIndex        =   5
      Top             =   6045
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   34
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":12098F
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":121659
      Top             =   6360
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   35
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":125777
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":126441
      Top             =   6360
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   18
      Left            =   5835
      TabIndex        =   4
      Top             =   6405
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   1
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":12A52E
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":12B1F8
      Top             =   4920
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   19
      Left            =   2685
      TabIndex        =   3
      Top             =   2085
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   36
      Left            =   3120
      MouseIcon       =   "frmSkills3.frx":12F2E5
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":12FFAF
      Top             =   2040
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   37
      Left            =   2400
      MouseIcon       =   "frmSkills3.frx":1340CD
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":134D97
      Top             =   2040
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   20
      Left            =   5880
      TabIndex        =   2
      Top             =   3405
      Width           =   285
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   38
      Left            =   6240
      MouseIcon       =   "frmSkills3.frx":138E84
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":139B4E
      Top             =   3360
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   39
      Left            =   5520
      MouseIcon       =   "frmSkills3.frx":13DC6C
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":13E936
      Top             =   3360
      Width           =   300
   End
   Begin VB.Label text1 
      Alignment       =   2  'Center
      BackStyle       =   0  'Transparent
      Caption         =   "0"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   255
      Index           =   21
      Left            =   8595
      TabIndex        =   1
      Top             =   4965
      Width           =   405
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   40
      Left            =   9000
      MouseIcon       =   "frmSkills3.frx":142A23
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":1436ED
      Top             =   4920
      Width           =   300
   End
   Begin VB.Image command1 
      Height          =   300
      Index           =   41
      Left            =   8280
      MouseIcon       =   "frmSkills3.frx":14780B
      MousePointer    =   99  'Custom
      Picture         =   "frmSkills3.frx":1484D5
      Top             =   4920
      Width           =   300
   End
   Begin VB.Label puntos 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "Puntos:"
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
      Height          =   210
      Left            =   1080
      TabIndex        =   0
      Top             =   840
      Width           =   735
   End
End
Attribute VB_Name = "frmSkills3"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'Argentum Online 0.9.0.9
'
'Copyright (C) 2002 Márquez Pablo Ignacio
'Copyright (C) 2002 Otto Perez
'Copyright (C) 2002 Aaron Perkins
'Copyright (C) 2002 Matías Fernando Pequeño
'
'This program is free software; you can redistribute it and/or modify
'it under the terms of the GNU General Public License as published by
'the Free Software Foundation; either version 2 of the License, or
'any later version.
'
'This program is distributed in the hope that it will be useful,
'but WITHOUT ANY WARRANTY; without even the implied warranty of
'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
'GNU General Public License for more details.
'
'You should have received a copy of the GNU General Public License
'along with this program; if not, write to the Free Software
'Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
'
'Argentum Online is based on Baronsoft's VB6 Online RPG
'You can contact the original creator of ORE at aaron@baronsoft.com
'for more information about ORE please visit http://www.baronsoft.com/
'
'
'You can contact me at:
'morgolock@speedy.com.ar
'www.geocities.com/gmorgolock
'Calle 3 número 983 piso 7 dto A
'La Plata - Pcia, Buenos Aires - Republica Argentina
'Código Postal 1900
'Pablo Ignacio Márquez

Option Explicit

Private Sub Command1_Click(Index As Integer)

    Call Audio.PlayWave(SND_CLICK)

    Dim Indice

    If Index Mod 2 = 0 Then

        If Alocados > 0 Then
            Indice = Index \ 2 + 1

            If Indice > NUMSKILLS Then Indice = NUMSKILLS

            If UserSkills(Indice) < MAXSKILLPOINTS And Val(Text1(Indice).Caption) < MAXSKILLPOINTS Then
                Text1(Indice).Caption = Val(Text1(Indice).Caption) + 1
                Flags(Indice) = Flags(Indice) + 1
                Alocados = Alocados - 1

            End If

        End If

    Else

        If Alocados < SkillPoints Then

            Indice = Index \ 2 + 1

            If Val(Text1(Indice).Caption) > 0 And Flags(Indice) > 0 Then
                Text1(Indice).Caption = Val(Text1(Indice).Caption) - 1
                Flags(Indice) = Flags(Indice) - 1
                Alocados = Alocados + 1

            End If

        End If

    End If

    puntos.Caption = "Puntos:" & Alocados

End Sub

Private Sub Command2_Click()

    Dim i   As Integer
    Dim cad As String

    For i = 1 To NUMSKILLS
        cad = cad & Flags(i) & ","
    Next
    SendData "SKSE" & cad
    'If Alocados = 0 Then frmMain.Label1.Visible = False
    SkillPoints = Alocados
    Unload Me

End Sub

Private Sub Form_Deactivate()

    Me.Visible = False

End Sub

Private Sub Form_Load()

    frmSkills3.Picture = cLoadPicture(DirInterfaces & "ventanas2.jpg")

    'Image1.Picture = cLoadPicture(DirInterfaces & "Botonok.jpg")

    'Nombres de los skills

    'Dim l
    Dim i As Integer
    'i = 1
    'For Each l In label2
    ' l.Caption = SkillsNames(i)
    '  l.AutoSize = True
    '   i = i + 1
    'Next
    'i = 0

    'Flags para saber que skills se modificaron
    ReDim Flags(1 To NUMSKILLS)

    'Cargamos el jpg correspondiente
    'For i = 0 To NUMSKILLS * 2 - 1
    '   If i Mod 2 = 0 Then
    '      Command1(i).Picture = cLoadPicture(DirInterfaces & "BotonMas.jpg")
    ' Else
    '    Command1(i).Picture = cLoadPicture(DirInterfaces & "BotonMenos.jpg")
    'End If
    'Next

    Alocados = SkillPoints

    'Call MakeWindowTransparent(frmSkills3.hwnd, 200)
End Sub

Private Sub Image1_Click()

    Dim i   As Integer
    Dim cad As String

    For i = 1 To NUMSKILLS
        cad = cad & Flags(i) & ","
    Next
    SendData "SKSE" & cad
    'If Alocados = 0 Then frmMain.Label1.Visible = False
    SkillPoints = Alocados
    Unload Me

End Sub

