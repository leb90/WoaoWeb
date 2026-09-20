VERSION 5.00
Begin VB.Form frmMap 
   BackColor       =   &H00FFC0C0&
   Caption         =   "Mapa del Mundo"
   ClientHeight    =   10770
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   15345
   FillStyle       =   0  'Solid
   LinkTopic       =   "Form1"
   Picture         =   "frmMapita.frx":0000
   ScaleHeight     =   10770
   ScaleWidth      =   15345
   StartUpPosition =   2  'CenterScreen
   Begin VB.CommandButton Command1 
      Caption         =   "Buscar"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   495
      Left            =   12480
      TabIndex        =   1
      Top             =   6480
      Width           =   2295
   End
   Begin VB.TextBox Text3 
      Alignment       =   2  'Center
      BackColor       =   &H00C0FFFF&
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   15.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   495
      Left            =   14040
      TabIndex        =   0
      Top             =   5760
      Width           =   975
   End
   Begin VB.Image Image303 
      Height          =   375
      Left            =   120
      MouseIcon       =   "frmMapita.frx":7B060
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image167 
      Height          =   375
      Left            =   600
      MouseIcon       =   "frmMapita.frx":7BD2A
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image169 
      Height          =   375
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":7C9F4
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image166 
      Height          =   375
      Left            =   1560
      MouseIcon       =   "frmMapita.frx":7D6BE
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image168 
      Height          =   375
      Left            =   2160
      MouseIcon       =   "frmMapita.frx":7E388
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image165 
      Height          =   375
      Left            =   2640
      MouseIcon       =   "frmMapita.frx":7F052
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image187 
      Height          =   375
      Left            =   120
      MouseIcon       =   "frmMapita.frx":7FD1C
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image189 
      Height          =   375
      Left            =   600
      MouseIcon       =   "frmMapita.frx":809E6
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image164 
      Height          =   375
      Left            =   120
      MouseIcon       =   "frmMapita.frx":816B0
      MousePointer    =   99  'Custom
      Top             =   9240
      Width           =   375
   End
   Begin VB.Image Image191 
      Height          =   375
      Left            =   600
      MouseIcon       =   "frmMapita.frx":8237A
      MousePointer    =   99  'Custom
      Top             =   9240
      Width           =   375
   End
   Begin VB.Image Image156 
      Height          =   375
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":83044
      MousePointer    =   99  'Custom
      Top             =   9240
      Width           =   375
   End
   Begin VB.Image Image192 
      Height          =   375
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":83D0E
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image194 
      Height          =   375
      Left            =   1560
      MouseIcon       =   "frmMapita.frx":849D8
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image277 
      Height          =   375
      Left            =   2160
      MouseIcon       =   "frmMapita.frx":856A2
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image291 
      Height          =   375
      Left            =   2640
      MouseIcon       =   "frmMapita.frx":8636C
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image292 
      Height          =   375
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":87036
      MousePointer    =   99  'Custom
      Top             =   9720
      Width           =   375
   End
   Begin VB.Image Image163 
      Height          =   375
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":87D00
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image91 
      Height          =   375
      Left            =   7080
      MouseIcon       =   "frmMapita.frx":889CA
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image92 
      Height          =   375
      Left            =   6960
      MouseIcon       =   "frmMapita.frx":89694
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image185 
      Height          =   375
      Left            =   7800
      MouseIcon       =   "frmMapita.frx":8A35E
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image186 
      Height          =   375
      Left            =   7800
      MouseIcon       =   "frmMapita.frx":8B028
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image183 
      Height          =   375
      Left            =   12840
      MouseIcon       =   "frmMapita.frx":8BCF2
      MousePointer    =   99  'Custom
      Top             =   8760
      Width           =   375
   End
   Begin VB.Image Image184 
      Height          =   375
      Left            =   12840
      MouseIcon       =   "frmMapita.frx":8C9BC
      MousePointer    =   99  'Custom
      Top             =   9120
      Width           =   375
   End
   Begin VB.Image Image40 
      Height          =   375
      Left            =   13200
      MouseIcon       =   "frmMapita.frx":8D686
      MousePointer    =   99  'Custom
      Top             =   8760
      Width           =   375
   End
   Begin VB.Image Image41 
      Height          =   375
      Left            =   13200
      MouseIcon       =   "frmMapita.frx":8E350
      MousePointer    =   99  'Custom
      Top             =   9120
      Width           =   375
   End
   Begin VB.Image Image42 
      Height          =   375
      Left            =   13200
      MouseIcon       =   "frmMapita.frx":8F01A
      MousePointer    =   99  'Custom
      Top             =   9480
      Width           =   375
   End
   Begin VB.Image Image43 
      Height          =   375
      Left            =   13200
      MouseIcon       =   "frmMapita.frx":8FCE4
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image44 
      Height          =   375
      Left            =   13200
      MouseIcon       =   "frmMapita.frx":909AE
      MousePointer    =   99  'Custom
      Top             =   10320
      Width           =   375
   End
   Begin VB.Image Image45 
      Height          =   375
      Left            =   12840
      MouseIcon       =   "frmMapita.frx":91678
      MousePointer    =   99  'Custom
      Top             =   10320
      Width           =   375
   End
   Begin VB.Image Image175 
      Height          =   375
      Left            =   12000
      MouseIcon       =   "frmMapita.frx":92342
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image172 
      Height          =   375
      Left            =   11640
      MouseIcon       =   "frmMapita.frx":9300C
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image171 
      Height          =   375
      Left            =   11640
      MouseIcon       =   "frmMapita.frx":93CD6
      MousePointer    =   99  'Custom
      Top             =   9480
      Width           =   375
   End
   Begin VB.Image Image174 
      Height          =   375
      Left            =   11640
      MouseIcon       =   "frmMapita.frx":949A0
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image181 
      Height          =   375
      Left            =   10920
      MouseIcon       =   "frmMapita.frx":9566A
      MousePointer    =   99  'Custom
      Top             =   10320
      Width           =   375
   End
   Begin VB.Image Image182 
      Height          =   375
      Left            =   10440
      MouseIcon       =   "frmMapita.frx":96334
      MousePointer    =   99  'Custom
      Top             =   9120
      Width           =   375
   End
   Begin VB.Image Image180 
      Height          =   375
      Left            =   10440
      MouseIcon       =   "frmMapita.frx":96FFE
      MousePointer    =   99  'Custom
      Top             =   9480
      Width           =   375
   End
   Begin VB.Image Image179 
      Height          =   375
      Left            =   10440
      MouseIcon       =   "frmMapita.frx":97CC8
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image178 
      Height          =   375
      Left            =   10440
      MouseIcon       =   "frmMapita.frx":98992
      MousePointer    =   99  'Custom
      Top             =   10320
      Width           =   375
   End
   Begin VB.Image Image145 
      Height          =   375
      Left            =   9720
      MouseIcon       =   "frmMapita.frx":9965C
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image144 
      Height          =   375
      Left            =   9360
      MouseIcon       =   "frmMapita.frx":9A326
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image48 
      Height          =   375
      Left            =   8880
      MouseIcon       =   "frmMapita.frx":9AFF0
      MousePointer    =   99  'Custom
      Top             =   9480
      Width           =   375
   End
   Begin VB.Image Image143 
      Height          =   375
      Left            =   8880
      MouseIcon       =   "frmMapita.frx":9BCBA
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image146 
      Height          =   375
      Left            =   8520
      MouseIcon       =   "frmMapita.frx":9C984
      MousePointer    =   99  'Custom
      Top             =   9000
      Width           =   375
   End
   Begin VB.Image Image142 
      Height          =   375
      Left            =   8520
      MouseIcon       =   "frmMapita.frx":9D64E
      MousePointer    =   99  'Custom
      Top             =   9480
      Width           =   375
   End
   Begin VB.Image Image141 
      Height          =   375
      Left            =   8520
      MouseIcon       =   "frmMapita.frx":9E318
      MousePointer    =   99  'Custom
      Top             =   9840
      Width           =   375
   End
   Begin VB.Image Image140 
      Height          =   375
      Left            =   8520
      MouseIcon       =   "frmMapita.frx":9EFE2
      MousePointer    =   99  'Custom
      Top             =   10200
      Width           =   375
   End
   Begin VB.Image Image110 
      Height          =   615
      Left            =   9000
      MouseIcon       =   "frmMapita.frx":9FCAC
      MousePointer    =   99  'Custom
      Top             =   3360
      Width           =   1215
   End
   Begin VB.Label Label4 
      Alignment       =   2  'Center
      BackColor       =   &H00FFC0C0&
      BackStyle       =   0  'Transparent
      Caption         =   "Atlas World of Argentum"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   14.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   9720
      TabIndex        =   7
      Top             =   120
      Width           =   6255
   End
   Begin VB.Image Image85 
      Height          =   735
      Left            =   5640
      MouseIcon       =   "frmMapita.frx":A0976
      MousePointer    =   99  'Custom
      Top             =   8040
      Width           =   1095
   End
   Begin VB.Image Image84 
      Height          =   615
      Left            =   5640
      MouseIcon       =   "frmMapita.frx":A1640
      MousePointer    =   99  'Custom
      Top             =   7440
      Width           =   735
   End
   Begin VB.Image Image83 
      Height          =   615
      Left            =   6360
      MouseIcon       =   "frmMapita.frx":A230A
      MousePointer    =   99  'Custom
      Top             =   7440
      Width           =   735
   End
   Begin VB.Image Image90 
      Height          =   1695
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":A2FD4
      MousePointer    =   99  'Custom
      Top             =   8640
      Width           =   735
   End
   Begin VB.Image Image89 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":A3C9E
      MousePointer    =   99  'Custom
      Top             =   8640
      Width           =   735
   End
   Begin VB.Image Image88 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":A4968
      MousePointer    =   99  'Custom
      Top             =   8040
      Width           =   735
   End
   Begin VB.Image Image95 
      Height          =   615
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":A5632
      MousePointer    =   99  'Custom
      Top             =   7440
      Width           =   735
   End
   Begin VB.Image Image93 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":A62FC
      MousePointer    =   99  'Custom
      Top             =   7440
      Width           =   735
   End
   Begin VB.Image Image148 
      Height          =   615
      Left            =   360
      MouseIcon       =   "frmMapita.frx":A6FC6
      MousePointer    =   99  'Custom
      Top             =   7560
      Width           =   735
   End
   Begin VB.Image Image147 
      Height          =   615
      Left            =   360
      MouseIcon       =   "frmMapita.frx":A7C90
      MousePointer    =   99  'Custom
      Top             =   6960
      Width           =   735
   End
   Begin VB.Image Image79 
      Height          =   615
      Left            =   360
      MouseIcon       =   "frmMapita.frx":A895A
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Image Image87 
      Height          =   615
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":A9624
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Image Image9 
      Height          =   615
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":AA2EE
      MousePointer    =   99  'Custom
      Top             =   5760
      Width           =   735
   End
   Begin VB.Image Image170 
      Height          =   615
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":AAFB8
      MousePointer    =   99  'Custom
      Top             =   5160
      Width           =   735
   End
   Begin VB.Image Image10 
      Height          =   375
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":ABC82
      MousePointer    =   99  'Custom
      Top             =   4800
      Width           =   735
   End
   Begin VB.Image Image75 
      Height          =   975
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":AC94C
      MousePointer    =   99  'Custom
      Top             =   3840
      Width           =   735
   End
   Begin VB.Image Image102 
      Height          =   615
      Left            =   1080
      MouseIcon       =   "frmMapita.frx":AD616
      MousePointer    =   99  'Custom
      Top             =   3240
      Width           =   735
   End
   Begin VB.Image Image106 
      Height          =   375
      Left            =   7920
      MouseIcon       =   "frmMapita.frx":AE2E0
      MousePointer    =   99  'Custom
      Top             =   3960
      Width           =   735
   End
   Begin VB.Image Image109 
      Height          =   615
      Left            =   8040
      MouseIcon       =   "frmMapita.frx":AEFAA
      MousePointer    =   99  'Custom
      Top             =   3360
      Width           =   735
   End
   Begin VB.Image Image123 
      Height          =   615
      Left            =   8160
      MouseIcon       =   "frmMapita.frx":AFC74
      MousePointer    =   99  'Custom
      Top             =   2760
      Width           =   735
   End
   Begin VB.Image Image149 
      Height          =   615
      Left            =   7560
      MouseIcon       =   "frmMapita.frx":B093E
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image139 
      Height          =   615
      Left            =   9720
      MouseIcon       =   "frmMapita.frx":B1608
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image138 
      Height          =   615
      Left            =   9000
      MouseIcon       =   "frmMapita.frx":B22D2
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image124 
      Height          =   615
      Left            =   8280
      MouseIcon       =   "frmMapita.frx":B2F9C
      MousePointer    =   99  'Custom
      Top             =   2160
      Width           =   735
   End
   Begin VB.Image Image127 
      Height          =   495
      Left            =   8160
      MouseIcon       =   "frmMapita.frx":B3C66
      MousePointer    =   99  'Custom
      Top             =   1680
      Width           =   735
   End
   Begin VB.Image Image128 
      Height          =   615
      Left            =   8160
      MouseIcon       =   "frmMapita.frx":B4930
      MousePointer    =   99  'Custom
      Top             =   1200
      Width           =   735
   End
   Begin VB.Image Image47 
      Height          =   615
      Left            =   8040
      MouseIcon       =   "frmMapita.frx":B55FA
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image133 
      Height          =   615
      Left            =   7200
      MouseIcon       =   "frmMapita.frx":B62C4
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image160 
      Height          =   615
      Left            =   6240
      MouseIcon       =   "frmMapita.frx":B6F8E
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image134 
      Height          =   615
      Left            =   5280
      MouseIcon       =   "frmMapita.frx":B7C58
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image135 
      Height          =   615
      Left            =   4440
      MouseIcon       =   "frmMapita.frx":B8922
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image136 
      Height          =   615
      Left            =   3720
      MouseIcon       =   "frmMapita.frx":B95EC
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image137 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":BA2B6
      MousePointer    =   99  'Custom
      Top             =   480
      Width           =   735
   End
   Begin VB.Image Image112 
      Height          =   615
      Left            =   8760
      MouseIcon       =   "frmMapita.frx":BAF80
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Image Image113 
      Height          =   615
      Left            =   8760
      MouseIcon       =   "frmMapita.frx":BBC4A
      MousePointer    =   99  'Custom
      Top             =   6960
      Width           =   735
   End
   Begin VB.Image Image114 
      Height          =   615
      Left            =   7920
      MouseIcon       =   "frmMapita.frx":BC914
      MousePointer    =   99  'Custom
      Top             =   6960
      Width           =   735
   End
   Begin VB.Image Image111 
      Height          =   615
      Left            =   7920
      MouseIcon       =   "frmMapita.frx":BD5DE
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Image Image152 
      Height          =   615
      Left            =   7920
      MouseIcon       =   "frmMapita.frx":BE2A8
      MousePointer    =   99  'Custom
      Top             =   5760
      Width           =   735
   End
   Begin VB.Image Image64 
      Height          =   615
      Left            =   8760
      MouseIcon       =   "frmMapita.frx":BEF72
      MousePointer    =   99  'Custom
      Top             =   4560
      Width           =   975
   End
   Begin VB.Image Image63 
      Height          =   615
      Left            =   7800
      MouseIcon       =   "frmMapita.frx":BFC3C
      MousePointer    =   99  'Custom
      Top             =   5040
      Width           =   735
   End
   Begin VB.Image Image62 
      Height          =   615
      Left            =   7800
      MouseIcon       =   "frmMapita.frx":C0906
      MousePointer    =   99  'Custom
      Top             =   4440
      Width           =   735
   End
   Begin VB.Image Image104 
      Height          =   615
      Left            =   7080
      MouseIcon       =   "frmMapita.frx":C15D0
      MousePointer    =   99  'Custom
      Top             =   4440
      Width           =   615
   End
   Begin VB.Image Image17 
      Height          =   615
      Left            =   6360
      MouseIcon       =   "frmMapita.frx":C229A
      MousePointer    =   99  'Custom
      Top             =   4560
      Width           =   735
   End
   Begin VB.Image Image20 
      Height          =   1095
      Left            =   5280
      MouseIcon       =   "frmMapita.frx":C2F64
      MousePointer    =   99  'Custom
      Top             =   5280
      Width           =   975
   End
   Begin VB.Image Image21 
      Height          =   615
      Left            =   5280
      MouseIcon       =   "frmMapita.frx":C3C2E
      MousePointer    =   99  'Custom
      Top             =   3840
      Width           =   975
   End
   Begin VB.Image Image16 
      Height          =   615
      Left            =   5280
      MouseIcon       =   "frmMapita.frx":C48F8
      MousePointer    =   99  'Custom
      Top             =   4560
      Width           =   975
   End
   Begin VB.Image Image150 
      Height          =   615
      Left            =   6240
      MouseIcon       =   "frmMapita.frx":C55C2
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   855
   End
   Begin VB.Image Image151 
      Height          =   615
      Left            =   5280
      MouseIcon       =   "frmMapita.frx":C628C
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   975
   End
   Begin VB.Image Image69 
      Height          =   615
      Left            =   4440
      MouseIcon       =   "frmMapita.frx":C6F56
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   855
   End
   Begin VB.Image Image190 
      Height          =   615
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":C7C20
      MousePointer    =   99  'Custom
      Top             =   3240
      Width           =   735
   End
   Begin VB.Image Image86 
      Height          =   735
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":C88EA
      MousePointer    =   99  'Custom
      Top             =   3960
      Width           =   735
   End
   Begin VB.Image Image12 
      Height          =   615
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":C95B4
      MousePointer    =   99  'Custom
      Top             =   4680
      Width           =   735
   End
   Begin VB.Image Image27 
      Height          =   615
      Left            =   4560
      MouseIcon       =   "frmMapita.frx":CA27E
      MousePointer    =   99  'Custom
      Top             =   5280
      Width           =   735
   End
   Begin VB.Image Image68 
      Height          =   615
      Left            =   3720
      MouseIcon       =   "frmMapita.frx":CAF48
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image56 
      Height          =   615
      Left            =   3720
      MouseIcon       =   "frmMapita.frx":CBC12
      MousePointer    =   99  'Custom
      Top             =   2880
      Width           =   735
   End
   Begin VB.Image Image81 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":CC8DC
      MousePointer    =   99  'Custom
      Top             =   3480
      Width           =   735
   End
   Begin VB.Image Image82 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":CD5A6
      MousePointer    =   99  'Custom
      Top             =   4080
      Width           =   735
   End
   Begin VB.Image Image11 
      Height          =   495
      Left            =   3960
      MouseIcon       =   "frmMapita.frx":CE270
      MousePointer    =   99  'Custom
      Top             =   4680
      Width           =   615
   End
   Begin VB.Image Image14 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":CEF3A
      MousePointer    =   99  'Custom
      Top             =   5160
      Width           =   735
   End
   Begin VB.Image Image26 
      Height          =   495
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":CFC04
      MousePointer    =   99  'Custom
      Top             =   5760
      Width           =   735
   End
   Begin VB.Image Image29 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":D08CE
      MousePointer    =   99  'Custom
      Top             =   6240
      Width           =   1095
   End
   Begin VB.Image Image30 
      Height          =   615
      Left            =   3840
      MouseIcon       =   "frmMapita.frx":D1598
      MousePointer    =   99  'Custom
      Top             =   6840
      Width           =   975
   End
   Begin VB.Image Image61 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":D2262
      MousePointer    =   99  'Custom
      Top             =   1080
      Width           =   735
   End
   Begin VB.Image Image60 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":D2F2C
      MousePointer    =   99  'Custom
      Top             =   1680
      Width           =   735
   End
   Begin VB.Image Image59 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":D3BF6
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image57 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":D48C0
      MousePointer    =   99  'Custom
      Top             =   2880
      Width           =   735
   End
   Begin VB.Image Image31 
      Height          =   615
      Left            =   2880
      MouseIcon       =   "frmMapita.frx":D558A
      MousePointer    =   99  'Custom
      Top             =   6960
      Width           =   975
   End
   Begin VB.Image Image32 
      Height          =   615
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":D6254
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Image Image4 
      Height          =   495
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":D6F1E
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   735
   End
   Begin VB.Image Image2 
      Height          =   615
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":D7BE8
      MousePointer    =   99  'Custom
      Top             =   5280
      Width           =   735
   End
   Begin VB.Image Image54 
      Height          =   615
      Left            =   3000
      MouseIcon       =   "frmMapita.frx":D88B2
      MousePointer    =   99  'Custom
      Top             =   3480
      Width           =   735
   End
   Begin VB.Image Image53 
      Height          =   615
      Left            =   3000
      MouseIcon       =   "frmMapita.frx":D957C
      MousePointer    =   99  'Custom
      Top             =   4080
      Width           =   735
   End
   Begin VB.Image Image66 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DA246
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   735
   End
   Begin VB.Image Image67 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DAF10
      MousePointer    =   99  'Custom
      Top             =   2880
      Width           =   735
   End
   Begin VB.Image Image70 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DBBDA
      MousePointer    =   99  'Custom
      Top             =   3480
      Width           =   735
   End
   Begin VB.Image Image71 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DC8A4
      MousePointer    =   99  'Custom
      Top             =   4080
      Width           =   735
   End
   Begin VB.Image Image8 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DD56E
      MousePointer    =   99  'Custom
      Top             =   4680
      Width           =   975
   End
   Begin VB.Image Image39 
      Height          =   615
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DE238
      MousePointer    =   99  'Custom
      Top             =   5280
      Width           =   735
   End
   Begin VB.Image Image35 
      Height          =   495
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":DEF02
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   735
   End
   Begin VB.Image Image1 
      Height          =   615
      Left            =   3120
      MouseIcon       =   "frmMapita.frx":DFBCC
      MousePointer    =   99  'Custom
      Top             =   4680
      Width           =   735
   End
   Begin VB.Image Image34 
      Height          =   735
      Left            =   2040
      MouseIcon       =   "frmMapita.frx":E0896
      MousePointer    =   99  'Custom
      Top             =   6360
      Width           =   735
   End
   Begin VB.Label Label6 
      BackColor       =   &H00C0FFFF&
      BorderStyle     =   1  'Fixed Single
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   1695
      Left            =   11760
      TabIndex        =   6
      Top             =   3960
      Width           =   3495
   End
   Begin VB.Label Label5 
      BackColor       =   &H00C0FFFF&
      BorderStyle     =   1  'Fixed Single
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   2535
      Left            =   11760
      TabIndex        =   5
      Top             =   960
      Width           =   3495
   End
   Begin VB.Label Label3 
      Alignment       =   2  'Center
      BackColor       =   &H00FFC0C0&
      BackStyle       =   0  'Transparent
      Caption         =   "Mapa:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   615
      Left            =   13080
      TabIndex        =   4
      Top             =   5880
      Width           =   1095
   End
   Begin VB.Label Label2 
      Alignment       =   2  'Center
      BackColor       =   &H00FFC0C0&
      BackStyle       =   0  'Transparent
      Caption         =   "Criaturas del Mapa:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   12240
      TabIndex        =   3
      Top             =   3600
      Width           =   2655
   End
   Begin VB.Label Label1 
      Alignment       =   2  'Center
      BackColor       =   &H00FFC0C0&
      BackStyle       =   0  'Transparent
      Caption         =   "Info del Mapa:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   -1  'True
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   375
      Left            =   12360
      TabIndex        =   2
      Top             =   600
      Width           =   2535
   End
End
Attribute VB_Name = "frmMap"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Dim Mapa8 As String
Dim Dir7  As String
Dim Vezc  As Byte

Private Sub Command1_Click()
    Dim busca7 As String
    busca7 = Text3.Text
    Dir7 = App.Path
    Mapa8 = "Mapa" & busca7
    Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
    Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
    Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
    'Option1(busca7).value = True

End Sub

Private Sub Form_Load()

    Dim n         As Integer

    Dir7 = App.Path
    
    Vezc = Vezc + 1
     
    Dir7 = App.Path
    If UserMap > 0 Then
        For n = 1 To 303
            Select Case UserMap
                Case 1
                'Debug.Print "asdasd"
                frmMap.Image1.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 2
                frmMap.Image2.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 3
                'frmMap.Image3.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 4
                frmMap.Image4.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 5
                'frmMap.Image5.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 6
                'frmMap.Image6.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 7
                'frmMap.Image7.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 8
                frmMap.Image8.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 9
                frmMap.Image9.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 10
                frmMap.Image10.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 11
                frmMap.Image11.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 12
                frmMap.Image12.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 13
                'frmMap.Image13.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 14
                frmMap.Image14.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 15
                'frmMap.Image15.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 16
                frmMap.Image16.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 17
                frmMap.Image17.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 18
                'frmMap.Image18.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 19
                'frmMap.Image19.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 20
                frmMap.Image20.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 21
                frmMap.Image21.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 22
                'frmMap.Image22.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 23
                'frmMap.Image23.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 24
                'frmMap.Image24.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 25
                'frmMap.Image25.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 26
                frmMap.Image26.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 27
                frmMap.Image27.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 28
                'frmMap.Image28.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 29
                frmMap.Image29.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 30
                frmMap.Image30.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 31
                frmMap.Image31.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 32
                frmMap.Image32.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 33
                'frmMap.Image33.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 34
                frmMap.Image34.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 35
                frmMap.Image35.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 36
                'frmMap.Image36.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 37
                'frmMap.Image37.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 38
                'frmMap.Image38.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 39
                frmMap.Image39.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 40
                frmMap.Image40.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 41
                frmMap.Image41.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 42
                frmMap.Image42.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 43
                frmMap.Image43.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 44
                frmMap.Image44.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 45
                frmMap.Image45.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 46
                'frmMap.Image46.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 47
                frmMap.Image47.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 48
                'frmMap.Image48.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 49
                'frmMap.Image49.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 50
                'frmMap.Image50.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 51
                'frmMap.Image51.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 52
                'frmMap.Image52.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 53
                frmMap.Image53.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 54
                frmMap.Image54.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 55
                'frmMap.Image55.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 56
                frmMap.Image56.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 57
                frmMap.Image57.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 58
                'frmMap.Image58.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 59
                frmMap.Image59.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 60
                frmMap.Image60.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 61
                frmMap.Image61.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 62
                frmMap.Image62.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 63
                frmMap.Image63.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 64
                frmMap.Image64.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 65
                'frmMap.Image65.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 66
                frmMap.Image66.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 67
                frmMap.Image67.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 68
                frmMap.Image68.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 69
                frmMap.Image69.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 70
                frmMap.Image70.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 71
                frmMap.Image71.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 72
                'frmMap.Image72.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 73
                'frmMap.Image73.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 74
                'frmMap.Image74.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 75
                frmMap.Image75.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 76
                'frmMap.Image76.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 77
                'frmMap.Image77.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 78
                'frmMap.Image78.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 79
                frmMap.Image79.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 80
                'frmMap.Image80.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 81
                frmMap.Image81.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 82
                frmMap.Image82.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 83
                frmMap.Image83.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 84
                frmMap.Image84.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 85
                frmMap.Image85.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 86
                frmMap.Image86.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 87
                frmMap.Image87.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 88
                frmMap.Image88.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 89
                frmMap.Image89.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 90
                frmMap.Image90.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 91
                frmMap.Image91.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 92
                frmMap.Image92.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 93
                frmMap.Image93.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 94
                'frmMap.Image94.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 95
                frmMap.Image95.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 96
                'frmMap.Image96.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 97
                'frmMap.Image97.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 98
                'frmMap.Image98.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 99
                'frmMap.Image99.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 100
                'frmMap.Image100.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 101
                'frmMap.Image101.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 102
                frmMap.Image102.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 103
               'frmMap.Image103.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 104
                frmMap.Image104.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 105
                'frmMap.Image105.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 106
                frmMap.Image106.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 107
                'frmMap.Image107.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 108
                'frmMap.Image108.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 109
                frmMap.Image109.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 110
                frmMap.Image110.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 111
                frmMap.Image111.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 112
                frmMap.Image112.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 113
                frmMap.Image113.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 114
                frmMap.Image114.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 115
                'frmMap.Image115.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 116
                'frmMap.Image116.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 117
                'frmMap.Image117.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 118
                'frmMap.Image118.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 119
                'frmMap.Image119.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 120
                'frmMap.Image120.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 121
                'frmMap.Image121.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 122
                'frmMap.Image122.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 123
                frmMap.Image123.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 124
                frmMap.Image124.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 125
                'frmMap.Image125.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 126
                'frmMap.Image126.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 127
                frmMap.Image127.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 128
                frmMap.Image128.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 129
                'frmMap.Image129.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 130
                'frmMap.Image130.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 131
                'frmMap.Image131.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 132
                'frmMap.Image132.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 133
                frmMap.Image133.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 134
                frmMap.Image134.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 135
                frmMap.Image135.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 136
                frmMap.Image136.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 137
                frmMap.Image137.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 138
                frmMap.Image138.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 139
                frmMap.Image139.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 140
                frmMap.Image140.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 141
                frmMap.Image141.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 142
                frmMap.Image142.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 143
                frmMap.Image143.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 144
                frmMap.Image144.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 145
                frmMap.Image145.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 146
                frmMap.Image146.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 147
                frmMap.Image147.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 148
                frmMap.Image148.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 149
                frmMap.Image149.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 150
                frmMap.Image150.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 151
                frmMap.Image151.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 152
                frmMap.Image152.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 153
                'frmMap.Image153.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 154
                'frmMap.Image154.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 155
                'frmMap.Image155.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 156
                frmMap.Image156.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 157
                'frmMap.Image157.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 158
                'frmMap.Image158.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 159
                'frmMap.Image159.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 160
                frmMap.Image160.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 161
                'frmMap.Image161.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 162
                'frmMap.Image162.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 163
                frmMap.Image163.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 164
                frmMap.Image164.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 165
                frmMap.Image165.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 166
                frmMap.Image166.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 167
                frmMap.Image167.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 168
                frmMap.Image168.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 169
                frmMap.Image169.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 170
                frmMap.Image170.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 171
                frmMap.Image171.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 172
                frmMap.Image172.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 173
                'frmMap.Image173.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 174
                frmMap.Image174.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 175
                frmMap.Image175.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 176
                'frmMap.Image176.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 177
                'frmMap.Image177.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 178
                frmMap.Image178.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 179
                frmMap.Image179.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 180
                frmMap.Image180.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 181
                frmMap.Image181.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 182
                frmMap.Image182.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 183
                frmMap.Image183.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 184
                frmMap.Image184.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 185
                frmMap.Image185.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 186
                frmMap.Image186.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 187
                frmMap.Image187.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 188
                'frmMap.Image188.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 189
                frmMap.Image189.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 190
                frmMap.Image190.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 191
                frmMap.Image191.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 192
                frmMap.Image192.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 193
                'frmMap.Image193.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 194
                'frmMap.Image194.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 195
                'frmMap.Image195.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 196
                'frmMap.Image196.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 197
                'frmMap.Image197.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 198
                'frmMap.Image198.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 199
                'frmMap.Image199.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 200
                'frmMap.Image200.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 201
                'frmMap.Image201.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 202
                'frmMap.Image202.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 203
                'frmMap.Image203.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 204
                'frmMap.Image204.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 205
                'frmMap.Image205.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 206
                'frmMap.Image206.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 207
                'frmMap.Image207.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 208
                'frmMap.Image208.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 209
                'frmMap.Image209.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 210
                'frmMap.Image210.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 211
                'frmMap.Image211.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 212
                'frmMap.Image212.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 213
                'frmMap.Image213.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 214
                'frmMap.Image214.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 215
                'frmMap.Image215.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 216
                'frmMap.Image216.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 217
                'frmMap.Image217.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 218
                'frmMap.Image218.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 219
                'frmMap.Image219.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 220
                'frmMap.Image220.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 221
                'frmMap.Image221.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 222
                'frmMap.Image222.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 223
                'frmMap.Image223.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 224
                'frmMap.Image224.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 225
                'frmMap.Image225.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 226
                'frmMap.Image226.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 227
                'frmMap.Image227.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 228
                'frmMap.Image228.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 229
                'frmMap.Image229.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 230
                'frmMap.Image230.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 231
                'frmMap.Image231.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 232
                'frmMap.Image232.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 233
                'frmMap.Image233.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 234
                'frmMap.Image234.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 235
                'frmMap.Image235.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 236
                'frmMap.Image236.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 237
                'frmMap.Image237.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 238
                'frmMap.Image238.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 239
                'frmMap.Image239.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 240
                'frmMap.Image240.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 241
                'frmMap.Image241.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 242
                'frmMap.Image242.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 243
                'frmMap.Image243.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 244
                'frmMap.Image244.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 245
               ' frmMap.Image245.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 246
               ' frmMap.Image246.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 247
               ' frmMap.Image247.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 248
              '  frmMap.Image248.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 249
              '  frmMap.Image249.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 250
              '  frmMap.Image250.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 251
              '  frmMap.Image251.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 252
               ' frmMap.Image252.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 253
                'frmMap.Image253.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 254
               ' frmMap.Image254.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 255
               ' frmMap.Image255.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 256
            '    frmMap.Image256.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 257
             '   frmMap.Image257.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 258
              '  frmMap.Image258.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 259
               ' frmMap.Image259.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 260
                'frmMap.Image260.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 261
                'frmMap.Image261.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 262
                'frmMap.Image262.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 263
               ' frmMap.Image263.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 264
             '   frmMap.Image264.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 265
              '  frmMap.Image265.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 266
               ' frmMap.Image266.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 267
                'frmMap.Image267.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 268
     '           frmMap.Image268.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 269
      '          frmMap.Image269.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 270
       '         frmMap.Image270.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 271
        '        frmMap.Image271.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 272
         '       frmMap.Image272.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 273
          '      frmMap.Image273.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 274
           '     frmMap.Image274.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 275
            '    frmMap.Image275.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 276
             '   frmMap.Image276.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 277
                frmMap.Image277.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 278
               ' frmMap.Image278.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 279
                'frmMap.Image279.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 280
  '              frmMap.Image280.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 281
   '             frmMap.Image281.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 282
    '            frmMap.Image282.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 283
     '           frmMap.Image283.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 284
      '          frmMap.Image284.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 285
       '         frmMap.Image285.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 286
        '        frmMap.Image286.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 287
         '       frmMap.Image287.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 288
          '      frmMap.Image288.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 289
           '     frmMap.Image289.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 290
            '    frmMap.Image290.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 291
                frmMap.Image291.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 292
                frmMap.Image292.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 293
               ' frmMap.Image293.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 294
                'frmMap.Image294.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 295
 '               frmMap.Image295.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 296
  '              frmMap.Image296.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 297
   '             frmMap.Image297.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 298
    '            frmMap.Image298.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 299
     '           frmMap.Image299.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 300
      '          frmMap.Image300.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 301
       '         frmMap.Image301.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 302
        '        frmMap.Image302.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
                Case 303
                frmMap.Image303.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
            End Select
        Next
    End If


End Sub


' de aca para abajo son todos los botones de los mapas, ya se se podria hacer 1 sola funcion , pero como todavia no se como reutilizar funciones en VB6 lo hice asi.
Private Sub Image1_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 1
End If

If UserMap = 1 Then

frmMap.Image1.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 1

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image2_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 2
End If

If UserMap = 2 Then

frmMap.Image2.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 2

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image3_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 3
End If

If UserMap = 3 Then

'frmMap.Image3.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 3

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image4_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 4
End If

If UserMap = 4 Then

frmMap.Image4.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 4

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image5_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 5
End If

If UserMap = 5 Then

'frmMap.Image5.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 5

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image6_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 6
End If

If UserMap = 6 Then

'frmMap.Image6.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 6

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image7_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 7
End If

If UserMap = 7 Then

'frmMap.Image7.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 7

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image8_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 8
End If

If UserMap = 8 Then

frmMap.Image8.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 8

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image9_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 9
End If

If UserMap = 9 Then

frmMap.Image9.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 9

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image10_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 10
End If

If UserMap = 10 Then

frmMap.Image10.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 10

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image11_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 11
End If

If UserMap = 11 Then

frmMap.Image11.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 11

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image12_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 12
End If

If UserMap = 12 Then

frmMap.Image12.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 12

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image13_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 13
End If

If UserMap = 13 Then

'frmMap.Image13.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 13

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image14_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 14
End If

If UserMap = 14 Then

frmMap.Image14.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 14

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image15_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 15
End If

If UserMap = 15 Then

'frmMap.Image15.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 15

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image16_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 16
End If

If UserMap = 16 Then

frmMap.Image16.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 16

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image17_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 17
End If

If UserMap = 17 Then

frmMap.Image17.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 17

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image20_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 20
End If

If UserMap = 20 Then

frmMap.Image20.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 20

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image21_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 21
End If

If UserMap = 21 Then

frmMap.Image21.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 21

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image22_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 22
End If

If UserMap = 22 Then

'frmMap.Image22.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 22

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image23_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 23
End If

If UserMap = 23 Then

'frmMap.Image23.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 23

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image24_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 24
End If

If UserMap = 24 Then

'frmMap.Image24.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 24

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image25_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 25
End If

If UserMap = 25 Then

'frmMap.Image25.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 25

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image26_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 26
End If

If UserMap = 26 Then

frmMap.Image26.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 26

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image27_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 27
End If

If UserMap = 27 Then

frmMap.Image27.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 27

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image28_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 28
End If

If UserMap = 28 Then

'frmMap.Image28.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 28

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image29_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 29
End If

If UserMap = 29 Then

frmMap.Image29.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 29

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image30_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 30
End If

If UserMap = 30 Then

frmMap.Image30.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 30

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image31_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 31
End If

If UserMap = 31 Then

frmMap.Image31.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 31

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image32_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 32
End If

If UserMap = 32 Then

frmMap.Image32.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 32

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image33_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 33
End If

If UserMap = 33 Then

'frmMap.Image33.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 33

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image34_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 34
End If

If UserMap = 34 Then

frmMap.Image34.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 34

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image35_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 35
End If

If UserMap = 35 Then

frmMap.Image35.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 35

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image36_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 36
End If

If UserMap = 36 Then

'frmMap.Image36.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 36

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image37_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 37
End If

If UserMap = 37 Then

'frmMap.Image37.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 37

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image38_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 38
End If

If UserMap = 38 Then

'frmMap.Image38.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 38

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image39_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 39
End If

If UserMap = 39 Then

frmMap.Image39.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 39

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image40_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 40
End If

If UserMap = 40 Then

frmMap.Image40.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 40

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image41_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 41
End If

If UserMap = 41 Then

frmMap.Image41.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 41

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image42_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 42
End If

If UserMap = 42 Then

frmMap.Image42.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 42

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image43_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 43
End If

If UserMap = 43 Then

frmMap.Image43.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 43

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image44_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 44
End If

If UserMap = 44 Then

frmMap.Image44.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 44

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image45_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 45
End If

If UserMap = 45 Then

frmMap.Image45.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 45

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image46_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 46
End If

If UserMap = 46 Then

'frmMap.Image46.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 46

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image47_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 47
End If

If UserMap = 47 Then

frmMap.Image47.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 47

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image48_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 48
End If

If UserMap = 48 Then

'frmMap.Image48.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 48

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image49_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 49
End If

If UserMap = 49 Then

'frmMap.Image49.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 49

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image50_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 50
End If

If UserMap = 50 Then

'frmMap.Image50.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 50

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image51_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 51
End If

If UserMap = 51 Then

'frmMap.Image51.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 51

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image52_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 52
End If

If UserMap = 52 Then

'frmMap.Image52.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 52

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image53_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 53
End If

If UserMap = 53 Then

frmMap.Image53.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 53

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image54_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 54
End If

If UserMap = 54 Then

frmMap.Image54.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 54

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image55_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 55
End If

If UserMap = 55 Then

'frmMap.Image55.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 55

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image56_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 56
End If

If UserMap = 56 Then

frmMap.Image56.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 56

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image57_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 57
End If

If UserMap = 57 Then

frmMap.Image57.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 57

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image58_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 58
End If

If UserMap = 58 Then

'frmMap.Image58.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 58

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image59_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 59
End If

If UserMap = 59 Then

frmMap.Image59.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 59

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image60_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 60
End If

If UserMap = 60 Then

frmMap.Image60.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 60

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image61_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 61
End If

If UserMap = 61 Then

frmMap.Image61.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 61

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image62_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 62
End If

If UserMap = 62 Then

frmMap.Image62.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 62

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image63_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 63
End If

If UserMap = 63 Then

frmMap.Image63.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 63

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image64_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 64
End If

If UserMap = 64 Then

frmMap.Image64.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 64

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image65_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 65
End If

If UserMap = 65 Then

'frmMap.Image65.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 65

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image66_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 66
End If

If UserMap = 66 Then

frmMap.Image66.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 66

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image67_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 67
End If

If UserMap = 67 Then

frmMap.Image67.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 67

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image68_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 68
End If

If UserMap = 68 Then

frmMap.Image68.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 68

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image69_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 69
End If

If UserMap = 69 Then

frmMap.Image69.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 69

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image70_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 70
End If

If UserMap = 70 Then

frmMap.Image70.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 70

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image71_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 71
End If

If UserMap = 71 Then

frmMap.Image71.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 71

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image72_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 72
End If

If UserMap = 72 Then

'frmMap.Image72.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 72

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image73_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 73
End If

If UserMap = 73 Then

'frmMap.Image73.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 73

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image74_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 74
End If

If UserMap = 74 Then

'frmMap.Image74.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 74

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image75_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 75
End If

If UserMap = 75 Then

frmMap.Image75.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 75

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image76_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 76
End If

If UserMap = 76 Then

'frmMap.Image76.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 76

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image77_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 77
End If

If UserMap = 77 Then

'frmMap.Image77.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 77

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image78_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 78
End If

If UserMap = 78 Then

'frmMap.Image78.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 78

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image79_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 79
End If

If UserMap = 79 Then

frmMap.Image79.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 79

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image80_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 80
End If

If UserMap = 80 Then

'frmMap.Image80.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 80

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image81_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 81
End If

If UserMap = 81 Then

frmMap.Image81.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 81

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image82_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 82
End If

If UserMap = 82 Then

frmMap.Image82.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 82

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image83_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 83
End If

If UserMap = 83 Then

frmMap.Image83.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 83

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image84_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 84
End If

If UserMap = 84 Then

frmMap.Image84.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 84

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image85_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 85
End If

If UserMap = 85 Then

frmMap.Image85.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 85

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image86_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 86
End If

If UserMap = 86 Then

frmMap.Image86.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 86

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image87_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 87
End If

If UserMap = 87 Then

frmMap.Image87.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 87

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image88_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 88
End If

If UserMap = 88 Then

frmMap.Image88.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 88

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image89_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 89
End If

If UserMap = 89 Then

frmMap.Image89.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 89

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image90_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 90
End If

If UserMap = 90 Then

frmMap.Image90.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 90

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image91_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 91
End If

If UserMap = 91 Then

frmMap.Image91.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 91

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image92_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 92
End If

If UserMap = 92 Then

frmMap.Image92.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 92

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image93_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 93
End If

If UserMap = 93 Then

frmMap.Image93.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 93

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image94_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 94
End If

If UserMap = 94 Then

'frmMap.Image94.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 94

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image95_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 95
End If

If UserMap = 95 Then

frmMap.Image95.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 95

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image96_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 96
End If

If UserMap = 96 Then

'frmMap.Image96.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 96

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image97_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 97
End If

If UserMap = 97 Then

'frmMap.Image97.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 97

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image98_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 98
End If

If UserMap = 98 Then

'frmMap.Image98.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 98

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image99_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 99
End If

If UserMap = 99 Then

'frmMap.Image99.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 99

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image100_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 100
End If

If UserMap = 100 Then

'frmMap.Image100.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 100

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image101_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 101
End If

If UserMap = 101 Then

'frmMap.Image101.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 101

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image102_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 102
End If

If UserMap = 102 Then

frmMap.Image102.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 102

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image103_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 103
End If

If UserMap = 103 Then

'frmMap.Image103.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 103

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image104_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 104
End If

If UserMap = 104 Then

frmMap.Image104.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 104

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image105_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 105
End If

If UserMap = 105 Then

'frmMap.Image105.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 105

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image106_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 106
End If

If UserMap = 106 Then

frmMap.Image106.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 106

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image107_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 107
End If

If UserMap = 107 Then

'frmMap.Image107.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 107

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image108_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 108
End If

If UserMap = 108 Then

'frmMap.Image108.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 108

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image109_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 109
End If

If UserMap = 109 Then

frmMap.Image109.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 109

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image110_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 110
End If

If UserMap = 110 Then

frmMap.Image110.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 110

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image111_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 111
End If

If UserMap = 111 Then

frmMap.Image111.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 111

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image112_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 112
End If

If UserMap = 112 Then

frmMap.Image112.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 112

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image113_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 113
End If

If UserMap = 113 Then

frmMap.Image113.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 113

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image114_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 114
End If

If UserMap = 114 Then

frmMap.Image114.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 114

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image115_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 115
End If

If UserMap = 115 Then

'frmMap.Image115.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 115

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image116_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 116
End If

If UserMap = 116 Then

'frmMap.Image116.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 116

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image117_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 117
End If

If UserMap = 117 Then

'frmMap.Image117.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 117

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image118_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 118
End If

If UserMap = 118 Then

'frmMap.Image118.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 118

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image119_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 119
End If

If UserMap = 119 Then

'frmMap.Image119.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 119

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image120_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 120
End If

If UserMap = 120 Then

'frmMap.Image120.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 120

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image121_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 121
End If

If UserMap = 121 Then

'frmMap.Image121.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 121

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image122_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 122
End If

If UserMap = 122 Then

'frmMap.Image122.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 122

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image123_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 123
End If

If UserMap = 123 Then

frmMap.Image123.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 123

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image124_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 124
End If

If UserMap = 124 Then

frmMap.Image124.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 124

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image125_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 125
End If

If UserMap = 125 Then

'frmMap.Image125.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 125

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image126_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 126
End If

If UserMap = 126 Then

'frmMap.Image126.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 126

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image127_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 127
End If

If UserMap = 127 Then

frmMap.Image127.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 127

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image128_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 128
End If

If UserMap = 128 Then

frmMap.Image128.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 128

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image129_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 129
End If

If UserMap = 129 Then

'frmMap.Image129.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 129

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image130_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 130
End If

If UserMap = 130 Then

'frmMap.Image130.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 130

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image131_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 131
End If

If UserMap = 131 Then

'frmMap.Image131.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 131

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image132_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 132
End If

If UserMap = 132 Then

'frmMap.Image132.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 132

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image133_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 133
End If

If UserMap = 133 Then

frmMap.Image133.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 133

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image134_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 134
End If

If UserMap = 134 Then

frmMap.Image134.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 134

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image135_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 135
End If

If UserMap = 135 Then

frmMap.Image135.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 135

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image136_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 136
End If

If UserMap = 136 Then

frmMap.Image136.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 136

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image137_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 137
End If

If UserMap = 137 Then

frmMap.Image137.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 137

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image138_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 138
End If

If UserMap = 138 Then

frmMap.Image138.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 138

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image139_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 139
End If

If UserMap = 139 Then

frmMap.Image139.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 139

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image140_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 140
End If

If UserMap = 140 Then

frmMap.Image140.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 140

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image141_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 141
End If

If UserMap = 141 Then

frmMap.Image141.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 141

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image142_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 142
End If

If UserMap = 142 Then

frmMap.Image142.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 142

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image143_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 143
End If

If UserMap = 143 Then

frmMap.Image143.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 143

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image144_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 144
End If

If UserMap = 144 Then

frmMap.Image144.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 144

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image145_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 145
End If

If UserMap = 145 Then

frmMap.Image145.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 145

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image146_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 146
End If

If UserMap = 146 Then

frmMap.Image146.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 146

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image147_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 147
End If

If UserMap = 147 Then

frmMap.Image147.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 147

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image148_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 148
End If

If UserMap = 148 Then

frmMap.Image148.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 148

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image149_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 149
End If

If UserMap = 149 Then

frmMap.Image149.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 149

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image150_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 150
End If

If UserMap = 150 Then

frmMap.Image150.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 150

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image151_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 151
End If

If UserMap = 151 Then

frmMap.Image151.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 151

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image152_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 152
End If

If UserMap = 152 Then

frmMap.Image152.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 152

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image153_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 153
End If

If UserMap = 153 Then

'frmMap.Image153.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 153

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image154_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 154
End If

If UserMap = 154 Then

'frmMap.Image154.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 154

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image155_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 155
End If

If UserMap = 155 Then

'frmMap.Image155.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 155

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image156_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 156
End If

If UserMap = 156 Then

frmMap.Image156.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 156

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image157_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 157
End If

If UserMap = 157 Then

'frmMap.Image157.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 157

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image158_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 158
End If

If UserMap = 158 Then

'frmMap.Image158.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 158

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image159_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 159
End If

If UserMap = 159 Then

'frmMap.Image159.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 159

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image160_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 160
End If

If UserMap = 160 Then

frmMap.Image160.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 160

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image161_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 161
End If

If UserMap = 161 Then

'frmMap.Image161.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 161

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image162_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 162
End If

If UserMap = 162 Then

'frmMap.Image162.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 162

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image163_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 163
End If

If UserMap = 163 Then

frmMap.Image163.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 163

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image164_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 164
End If

If UserMap = 164 Then

frmMap.Image164.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 164

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image165_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 165
End If

If UserMap = 165 Then

frmMap.Image165.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 165

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image166_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 166
End If

If UserMap = 166 Then

frmMap.Image166.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 166

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image167_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 167
End If

If UserMap = 167 Then

frmMap.Image167.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 167

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image168_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 168
End If

If UserMap = 168 Then

frmMap.Image168.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 168

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image169_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 169
End If

If UserMap = 169 Then

frmMap.Image169.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 169

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image170_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 170
End If

If UserMap = 170 Then

frmMap.Image170.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 170

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image171_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 171
End If

If UserMap = 171 Then

frmMap.Image171.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 171

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image172_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 172
End If

If UserMap = 172 Then

frmMap.Image172.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 172

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image173_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 173
End If

If UserMap = 173 Then

'frmMap.Image173.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 173

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image174_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 174
End If

If UserMap = 174 Then

frmMap.Image174.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 174

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image175_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 175
End If

If UserMap = 175 Then

frmMap.Image175.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 175

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image176_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 176
End If

If UserMap = 176 Then

'frmMap.Image176.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 176

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image177_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 177
End If

If UserMap = 177 Then

'frmMap.Image177.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 177

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image178_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 178
End If

If UserMap = 178 Then

frmMap.Image178.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 178

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image179_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 179
End If

If UserMap = 179 Then

frmMap.Image179.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 179

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image180_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 180
End If

If UserMap = 180 Then

frmMap.Image180.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 180

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image181_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 181
End If

If UserMap = 181 Then

frmMap.Image181.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 181

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image182_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 182
End If

If UserMap = 182 Then

frmMap.Image182.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 182

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image183_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 183
End If

If UserMap = 183 Then

frmMap.Image183.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 183

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image184_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 184
End If

If UserMap = 184 Then

frmMap.Image184.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 184

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image185_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 185
End If

If UserMap = 185 Then

frmMap.Image185.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 185

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image186_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 186
End If

If UserMap = 186 Then

frmMap.Image186.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 186

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image187_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 187
End If

If UserMap = 187 Then

frmMap.Image187.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 187

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image188_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 188
End If

If UserMap = 188 Then

'frmMap.Image188.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 188

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image189_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 189
End If

If UserMap = 189 Then

frmMap.Image189.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 189

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image190_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 190
End If

If UserMap = 190 Then

frmMap.Image190.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 190

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image191_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 191
End If

If UserMap = 191 Then

frmMap.Image191.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 191

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image192_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 192
End If

If UserMap = 192 Then

frmMap.Image192.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 192

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image193_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 193
End If

If UserMap = 193 Then

'frmMap.Image193.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 193

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image194_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 194
End If

If UserMap = 194 Then

'frmMap.Image194.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 194

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image195_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 195
End If

If UserMap = 195 Then

'frmMap.Image195.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 195

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image196_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 196
End If

If UserMap = 196 Then

'frmMap.Image196.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 196

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image197_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 197
End If

If UserMap = 197 Then

'frmMap.Image197.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 197

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image198_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 198
End If

If UserMap = 198 Then

'frmMap.Image198.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 198

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image199_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 199
End If

If UserMap = 199 Then

'frmMap.Image199.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 199

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image200_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 200
End If

If UserMap = 200 Then

'frmMap.Image200.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 200

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image201_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 201
End If

If UserMap = 201 Then

'frmMap.Image201.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 201

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image202_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 202
End If

If UserMap = 202 Then

'frmMap.Image202.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 202

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image203_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 203
End If

If UserMap = 203 Then

'frmMap.Image203.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 203

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image204_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 204
End If

If UserMap = 204 Then

'frmMap.Image204.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 204

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image205_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 205
End If

If UserMap = 205 Then

'frmMap.Image205.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 205

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image206_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 206
End If

If UserMap = 206 Then

'frmMap.Image206.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 206

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image207_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 207
End If

If UserMap = 207 Then

'frmMap.Image207.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 207

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image208_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 208
End If

If UserMap = 208 Then

'frmMap.Image208.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 208

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image209_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 209
End If

If UserMap = 209 Then

'frmMap.Image209.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 209

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image210_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 210
End If

If UserMap = 210 Then

'frmMap.Image210.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 210

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image211_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 211
End If

If UserMap = 211 Then

'frmMap.Image211.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 211

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image212_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 212
End If

If UserMap = 212 Then

'frmMap.Image212.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 212

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image213_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 213
End If

If UserMap = 213 Then

'frmMap.Image213.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 213

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image214_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 214
End If

If UserMap = 214 Then

'frmMap.Image214.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 214

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image215_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 215
End If

If UserMap = 215 Then

'frmMap.Image215.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 215

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image216_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 216
End If

If UserMap = 216 Then

'frmMap.Image216.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 216

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image217_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 217
End If

If UserMap = 217 Then

'frmMap.Image217.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 217

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image218_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 218
End If

If UserMap = 218 Then

'frmMap.Image218.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 218

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image219_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 219
End If

If UserMap = 219 Then

'frmMap.Image219.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 219

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image220_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 220
End If

If UserMap = 220 Then

'frmMap.Image220.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 220

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image221_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 221
End If

If UserMap = 221 Then

'frmMap.Image221.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 221

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image222_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 222
End If

If UserMap = 222 Then

'frmMap.Image222.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 222

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image223_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 223
End If

If UserMap = 223 Then

'frmMap.Image223.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 223

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image224_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 224
End If

If UserMap = 224 Then

'frmMap.Image224.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 224

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image225_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 225
End If

If UserMap = 225 Then

'frmMap.Image225.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 225

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image226_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 226
End If

If UserMap = 226 Then

'frmMap.Image226.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 226

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image227_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 227
End If

If UserMap = 227 Then

'frmMap.Image227.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 227

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image228_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 228
End If

If UserMap = 228 Then

'frmMap.Image228.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 228

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image229_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 229
End If

If UserMap = 229 Then

'frmMap.Image229.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 229

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image230_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 230
End If

If UserMap = 230 Then

'frmMap.Image230.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 230

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image231_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 231
End If

If UserMap = 231 Then

'frmMap.Image231.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 231

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image232_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 232
End If

If UserMap = 232 Then

'frmMap.Image232.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 232

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image233_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 233
End If

If UserMap = 233 Then

'frmMap.Image233.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 233

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image234_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 234
End If

If UserMap = 234 Then

'frmMap.Image234.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 234

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image235_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 235
End If

If UserMap = 235 Then

'frmMap.Image235.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 235

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image236_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 236
End If

If UserMap = 236 Then

'frmMap.Image236.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 236

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image237_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 237
End If

If UserMap = 237 Then

'frmMap.Image237.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 237

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image238_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 238
End If

If UserMap = 238 Then

'frmMap.Image238.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 238

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image239_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 239
End If

If UserMap = 239 Then

'frmMap.Image239.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 239

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image240_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 240
End If

If UserMap = 240 Then

'frmMap.Image240.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 240

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image241_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 241
End If

If UserMap = 241 Then

'frmMap.Image241.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 241

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image242_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 242
End If

If UserMap = 242 Then

'frmMap.Image242.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 242

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image243_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 243
End If

If UserMap = 243 Then

'frmMap.Image243.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 243

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image244_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 244
End If

If UserMap = 244 Then

'frmMap.Image244.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 244

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image245_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 245
End If

If UserMap = 245 Then

'frmMap.Image245.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 245

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image246_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 246
End If

If UserMap = 246 Then

'frmMap.Image246.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 246

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image247_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 247
End If

If UserMap = 247 Then

'frmMap.Image247.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 247

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image248_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 248
End If

If UserMap = 248 Then

'frmMap.Image248.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 248

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image249_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 249
End If

If UserMap = 249 Then

'frmMap.Image249.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 249

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image250_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 250
End If

If UserMap = 250 Then

'frmMap.Image250.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 250

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image251_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 251
End If

If UserMap = 251 Then

'frmMap.Image251.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 251

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image252_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 252
End If

If UserMap = 252 Then

'frmMap.Image252.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 252

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image253_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 253
End If

If UserMap = 253 Then

'frmMap.Image253.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 253

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image254_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 254
End If

If UserMap = 254 Then

'frmMap.Image254.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 254

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image255_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 255
End If

If UserMap = 255 Then

'frmMap.Image255.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 255

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image256_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 256
End If

If UserMap = 256 Then

'frmMap.Image256.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 256

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image257_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 257
End If

If UserMap = 257 Then

'frmMap.Image257.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 257

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image258_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 258
End If

If UserMap = 258 Then

'frmMap.Image258.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 258

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image259_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 259
End If

If UserMap = 259 Then

'frmMap.Image259.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 259

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image260_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 260
End If

If UserMap = 260 Then

'frmMap.Image260.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 260

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image261_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 261
End If

If UserMap = 261 Then

'frmMap.Image261.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 261

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image262_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 262
End If

If UserMap = 262 Then

'frmMap.Image262.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 262

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image263_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 263
End If

If UserMap = 263 Then

'frmMap.Image263.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 263

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image264_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 264
End If

If UserMap = 264 Then

'frmMap.Image264.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 264

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image265_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 265
End If

If UserMap = 265 Then

'frmMap.Image265.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 265

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image266_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 266
End If

If UserMap = 266 Then

'frmMap.Image266.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 266

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image267_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 267
End If

If UserMap = 267 Then

'frmMap.Image267.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 267

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image268_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 268
End If

If UserMap = 268 Then

'frmMap.Image268.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 268

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image269_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 269
End If

If UserMap = 269 Then

'frmMap.Image269.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 269

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image270_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 270
End If

If UserMap = 270 Then

'frmMap.Image270.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 270

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image271_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 271
End If

If UserMap = 271 Then

'frmMap.Image271.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 271

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image272_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 272
End If

If UserMap = 272 Then

'frmMap.Image272.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 272

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image273_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 273
End If

If UserMap = 273 Then

'frmMap.Image273.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 273

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image274_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 274
End If

If UserMap = 274 Then

'frmMap.Image274.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 274

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image275_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 275
End If

If UserMap = 275 Then

'frmMap.Image275.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 275

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image276_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 276
End If

If UserMap = 276 Then

'frmMap.Image276.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 276

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image277_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 277
End If

If UserMap = 277 Then

frmMap.Image277.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 277

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image278_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 278
End If

If UserMap = 278 Then

'frmMap.Image278.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 278

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image279_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 279
End If

If UserMap = 279 Then

'frmMap.Image279.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 279

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image280_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 280
End If

If UserMap = 280 Then

'frmMap.Image280.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 280

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image281_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 281
End If

If UserMap = 281 Then

'frmMap.Image281.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 281

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image282_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 282
End If

If UserMap = 282 Then

'frmMap.Image282.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 282

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image283_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 283
End If

If UserMap = 283 Then

'frmMap.Image283.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 283

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image284_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 284
End If

If UserMap = 284 Then

'frmMap.Image284.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 284

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image285_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 285
End If

If UserMap = 285 Then

'frmMap.Image285.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 285

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image286_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 286
End If

If UserMap = 286 Then

'frmMap.Image286.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 286

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image287_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 287
End If

If UserMap = 287 Then

'frmMap.Image287.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 287

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image288_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 288
End If

If UserMap = 288 Then

'frmMap.Image288.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 288

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image289_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 289
End If

If UserMap = 289 Then

'frmMap.Image289.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 289

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image290_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 290
End If

If UserMap = 290 Then

'frmMap.Image290.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 290

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image291_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 291
End If

If UserMap = 291 Then

frmMap.Image291.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 291

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image292_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 292
End If

If UserMap = 292 Then

frmMap.Image292.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 292

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image293_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 293
End If

If UserMap = 293 Then

'frmMap.Image293.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 293

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image294_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 294
End If

If UserMap = 294 Then

'frmMap.Image294.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 294

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image295_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 295
End If

If UserMap = 295 Then

'frmMap.Image295.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 295

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image296_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 296
End If

If UserMap = 296 Then

'frmMap.Image296.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 296

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image297_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 297
End If

If UserMap = 297 Then

'frmMap.Image297.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 297

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image298_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 298
End If

If UserMap = 298 Then

'frmMap.Image298.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 298

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image299_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 299
End If

If UserMap = 299 Then

'frmMap.Image299.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 299

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image300_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 300
End If

If UserMap = 300 Then

'frmMap.Image300.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 300

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image301_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 301
End If

If UserMap = 301 Then

'frmMap.Image301.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 301

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image302_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 302
End If

If UserMap = 302 Then

'frmMap.Image302.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 302

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub

Private Sub Image303_Click()
Dim busca7 As String
Dim Index As Integer


Dir7 = App.Path

Call Audio.PlayWave(SND_CLICK)

If Vezc > 0 Then
Vezc = 0
Index = UserMap
Else
Index = 303
End If

If UserMap = 303 Then

frmMap.Image303.Picture = cLoadPicture(Dir7 & "\Recursos\Graficos\puntito.JPG")
End If


busca7 = 303

Mapa8 = "Mapa" & busca7
Label6.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "bichos")
Label5.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "Info")
Label4.Caption = GetVar(Dir7 & "\Data.txt", Mapa8, "nombre")
Text3.Text = busca7

End Sub
