VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "CBmpMan"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder6" ,"Yes"
Attribute VB_Ext_KEY = "Top_Level" ,"Yes"
'**************************************************************
' clsSurfaceManDyn.cls - Inherits from clsSurfaceManager. Is designed to load
'surfaces dynamically without using more than an arbitrary amount of Mb.
'For removale it uses LRU, attempting to just keep in memory those surfaces
'that are actually usefull.
'
' Developed by Maraxus (Juan Martín Sotuyo Dodero - juansotuyo@hotmail.com)
' Last Modify Date: 3/06/2006
'**************************************************************

'**************************************************************
'This program is free software; you can redistribute it and/or modify
'it under the terms of the GNU General Public License as published by
'the Free Software Foundation; either version 2 of the License, or
'any later version.
'
'This program is distributed in the hope that it will be useful,
'but WITHOUT ANY WARRANTY; without even the implied warranty of
'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
'Affero General Public License for more details.
'
'You should have received a copy of the GNU General Public License
'along with this program; if not, write to the Free Software
'Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
'
'Argentum Online is based on Baronsoft's VB6 Online RPG
'You can contact the original creator of ORE at aaron@baronsoft.com
'for more information about ORE please visit http://www.baronsoft.com/
'**************************************************************

Option Explicit

Private Const BYTES_PER_MB          As Long = 1048576   '1Mb = 1024 Kb = 1024 * 1024 bytes = 1048576 bytes
Private Const MIN_MEMORY_TO_USE     As Long = 4 * BYTES_PER_MB    '4 Mb
Private Const DEFAULT_MEMORY_TO_USE As Long = 16 * BYTES_PER_MB  '16 Mb

'Number of buckets in our hash table. Must be a nice prime number.
Const HASH_TABLE_SIZE               As Long = 337

Private Type SURFACE_ENTRY_DYN

    fileIndex As Long
    lastAccess As Long
    surface As DirectDrawSurface7

End Type

Private Type HashNode

    surfaceCount As Integer
    SurfaceEntry() As SURFACE_ENTRY_DYN

End Type

Private surfaceList(HASH_TABLE_SIZE - 1) As HashNode

Private DirectDraw                       As DirectDraw7
Private maxBytesToUse                    As Long
Private usedBytes                        As Long
Private ResourcePath                     As String

Private Declare Function GetTickCount Lib "kernel32" () As Long

Private Const DIB_PAL_COLORS As Long = 1
Private Const DIB_RGB_COLORS As Long = 0
Private Declare Function SetDIBitsToDevice Lib "GDI32.dll" (ByVal hdc As Long, _
                                                            ByVal XDest As Long, _
                                                            ByVal YDest As Long, _
                                                            ByVal dwWidth As Long, _
                                                            ByVal dwHeight As Long, _
                                                            ByVal xSrc As Long, _
                                                            ByVal ySrc As Long, _
                                                            ByVal uStartScan As Long, _
                                                            ByVal CScanLine As Long, _
                                                            lpBits As Any, _
                                                            lpbmi As BITMAPINFO, _
                                                            ByVal fuColorUse As Long) As Long

Private Sub Class_Initialize()

    '**************************************************************
    'Author: Juan Martín Sotuyo Dodero
    'Last Modify Date: 3/06/2006
    '
    '**************************************************************
    usedBytes = 0
    maxBytesToUse = MIN_MEMORY_TO_USE

End Sub

Private Sub Class_Terminate()

    '**************************************************************
    'Author: Juan Martín Sotuyo Dodero
    'Last Modify Date: 3/06/2006
    'Clean up
    '**************************************************************
    Dim i As Long
    Dim j As Long

    'Destroy every surface in memory
    For i = 0 To HASH_TABLE_SIZE - 1

        With surfaceList(i)

            For j = 1 To .surfaceCount
                Set .SurfaceEntry(j).surface = Nothing
            Next j

            'Destroy the arrays
            Erase .SurfaceEntry

        End With

    Next i

End Sub

Public Sub Initialize(ByRef DD As DirectDraw7, ByVal graphicPath As String, Optional ByVal maxMemoryUsageInMb As Long = -1)

    '**************************************************************
    'Author: Juan Martín Sotuyo Dodero
    'Last Modify Date: 3/06/2006
    'Initializes the manager
    '**************************************************************
    Set DirectDraw = DD

    ResourcePath = graphicPath

    If maxMemoryUsageInMb = -1 Then
        maxBytesToUse = DEFAULT_MEMORY_TO_USE   ' 16 Mb by default
    ElseIf maxMemoryUsageInMb * BYTES_PER_MB < MIN_MEMORY_TO_USE Then
        maxBytesToUse = MIN_MEMORY_TO_USE       ' 4 Mb is the minimum allowed
    Else
        maxBytesToUse = maxMemoryUsageInMb * BYTES_PER_MB

    End If

End Sub

Public Property Get surface(ByVal fileIndex As Long) As DirectDrawSurface7

    '**************************************************************
    'Author: Juan Martín Sotuyo Dodero
    'Last Modify Date: 3/06/2006
    'Retrieves the requested texture
    '**************************************************************
    Dim i As Long

    ' Search the index on the list
    With surfaceList(fileIndex Mod HASH_TABLE_SIZE)

        For i = 1 To .surfaceCount

            If .SurfaceEntry(i).fileIndex = fileIndex Then
                .SurfaceEntry(i).lastAccess = GetTickCount
                Set surface = .SurfaceEntry(i).surface
                Exit Property

            End If

        Next i

    End With

    'Not in memory, load it!
    Set surface = LoadSurface(fileIndex)

End Property

Private Function LoadSurface(ByVal fileIndex As Long) As DirectDrawSurface7

    '**************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 05/11/2009
    'Loads the surface named fileIndex + ".bmp" and inserts it to the
    'surface list in the listIndex position
    '**************************************************************
    On Error GoTo ErrHandler

    Dim newSurface As SURFACE_ENTRY_DYN
    Dim ddsd       As DDSURFACEDESC2
    Dim ddck       As DDCOLORKEY
    Dim data()     As Byte
    Dim bmpInfo    As BITMAPINFO
    Dim sDC        As Long

    'get Bitmap
    Call Get_Bitmap(ResourcePath, CStr(fileIndex) & ".BMP", bmpInfo, data)

    'Set up the surface desc
    ddsd.lFlags = DDSD_CAPS Or DDSD_HEIGHT Or DDSD_WIDTH
    ddsd.ddsCaps.lCaps = DDSCAPS_OFFSCREENPLAIN Or DDSCAPS_SYSTEMMEMORY
    ddsd.lWidth = bmpInfo.bmiHeader.biWidth
    ddsd.lHeight = bmpInfo.bmiHeader.biHeight

    With newSurface
        .fileIndex = fileIndex

        'Set last access time (if we didn't we would reckon this texture as the one lru)
        .lastAccess = GetTickCount

        'Load surface
        Set .surface = DirectDraw.CreateSurface(ddsd)

        sDC = .surface.GetDC

        Call SetDIBitsToDevice(sDC, 0, 0, bmpInfo.bmiHeader.biWidth, bmpInfo.bmiHeader.biHeight, 0, 0, 0, bmpInfo.bmiHeader.biHeight, data(0), _
                bmpInfo, DIB_RGB_COLORS)

        Call .surface.ReleaseDC(sDC)

        'Set colorkey
        ddck.high = 0
        ddck.low = 0
        Call .surface.SetColorKey(DDCKEY_SRCBLT, ddck)

        'Retrieve the updated surface desc
        Call .surface.GetSurfaceDesc(ddsd)

    End With

    'Insert surface to the list
    With surfaceList(fileIndex Mod HASH_TABLE_SIZE)
        .surfaceCount = .surfaceCount + 1

        ReDim Preserve .SurfaceEntry(1 To .surfaceCount) As SURFACE_ENTRY_DYN

        .SurfaceEntry(.surfaceCount) = newSurface

        Set LoadSurface = newSurface.surface

    End With

    'Update used bytes
    usedBytes = usedBytes + ddsd.lHeight * ddsd.lPitch

    'Check if we have exceeded our allowed share of memory usage
    Do While usedBytes > maxBytesToUse

        'Remove a file. If no file could be removed we continue, if the file was previous to our surface we update the index
        If Not RemoveLRU() Then
            Exit Do

        End If

    Loop
    Exit Function

ErrHandler:

    If Err.Number = DDERR_OUTOFMEMORY Or Err.Number = DDERR_OUTOFVIDEOMEMORY Then

        'Remove a surface and try again
        If RemoveLRU() Then
            Resume
        Else
            MsgBox "No hay memoria disponible! El programa abortará. Cierra algunos programas e intenta de nuevo"
            End

        End If

    Else
        MsgBox "Un error inesperado ocurrió al intentar cargar el gráfico " & CStr(fileIndex) & ".BMP" & ". " & vbCrLf & "El código de error es " & _
                CStr(Err.Number) & " - " & Err.Description & vbCrLf & vbCrLf & "Copia este mensaje y notifica a los administradores.", vbOKOnly Or _
                vbCritical Or vbExclamation, "Error"
        End

    End If

End Function

Private Function RemoveLRU() As Boolean

    '**************************************************************
    'Author: Juan Martín Sotuyo Dodero
    'Last Modify Date: 3/06/2006
    'Removes the Least Recently Used surface to make some room for new ones
    '**************************************************************
    Dim LRUi    As Long
    Dim LRUj    As Long
    Dim LRUtime As Long
    Dim i       As Long
    Dim j       As Long
    Dim ddsd    As DDSURFACEDESC2

    LRUtime = GetTickCount

    'Check out through the whole list for the least recently used
    For i = 0 To HASH_TABLE_SIZE - 1

        With surfaceList(i)

            For j = 1 To .surfaceCount

                If LRUtime > .SurfaceEntry(j).lastAccess Then
                    LRUi = i
                    LRUj = j
                    LRUtime = .SurfaceEntry(j).lastAccess

                End If

            Next j

        End With

    Next i

    If LRUj Then
        RemoveLRU = True
        'Retrieve the surface desc
        Call surfaceList(LRUi).SurfaceEntry(LRUj).surface.GetSurfaceDesc(ddsd)

        'Remove it
        Set surfaceList(LRUi).SurfaceEntry(LRUj).surface = Nothing
        surfaceList(LRUi).SurfaceEntry(LRUj).fileIndex = 0

        'Move back the list (if necessary)
        With surfaceList(LRUi)

            For j = LRUj To .surfaceCount - 1
                .SurfaceEntry(j) = .SurfaceEntry(j + 1)
            Next j

            .surfaceCount = .surfaceCount - 1

            If .surfaceCount Then
                ReDim Preserve .SurfaceEntry(1 To .surfaceCount) As SURFACE_ENTRY_DYN
            Else
                Erase .SurfaceEntry

            End If

        End With

        'Update the used bytes
        usedBytes = usedBytes - ddsd.lHeight * ddsd.lPitch

    End If

End Function

