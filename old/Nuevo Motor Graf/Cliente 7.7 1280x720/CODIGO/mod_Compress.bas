Attribute VB_Name = "mod_Compress"
Option Explicit

Public Const GRH_SOURCE_FILE_EXT As String = ".bmp"
Public Const GRH_RESOURCE_FILE   As String = "Graphics.AO"
Public Const GRH_PATCH_FILE      As String = "Graphics.PATCH"

'This structure will describe our binary file's
'size, number and version of contained files
Public Type FILEHEADER

    lngNumFiles As Long                 'How many files are inside?
    lngFileSize As Long                 'How big is this file? (Used to check integrity)
    lngFileVersion As Long              'The resource version (Used to patch)

End Type

'This structure will describe each file contained
'in our binary file
Public Type INFOHEADER

    lngFileSize As Long             'How big is this chunk of stored data?
    lngFileStart As Long            'Where does the chunk start?
    strFileName As String * 16      'What's the name of the file this data came from?
    lngFileSizeUncompressed As Long    'How big is the file compressed

End Type

Private Declare Function uncompress Lib "zlib.dll" (dest As Any, destlen As Any, Src As Any, ByVal srclen As Long) As Long

Private Declare Sub CopyMemory Lib "kernel32" Alias "RtlMoveMemory" (ByRef dest As Any, ByRef source As Any, ByVal byteCount As Long)

'BitMaps Strucures
Public Type BITMAPFILEHEADER

    bfType As Integer
    bfSize As Long
    bfReserved1 As Integer
    bfReserved2 As Integer
    bfOffBits As Long

End Type

Public Type BITMAPINFOHEADER

    biSize As Long
    biWidth As Long
    biHeight As Long
    biPlanes As Integer
    biBitCount As Integer
    biCompression As Long
    biSizeImage As Long
    biXPelsPerMeter As Long
    biYPelsPerMeter As Long
    biClrUsed As Long
    biClrImportant As Long

End Type

Public Type RGBQUAD

    rgbBlue As Byte
    rgbGreen As Byte
    rgbRed As Byte
    rgbReserved As Byte

End Type

Public Type BITMAPINFO

    bmiHeader As BITMAPINFOHEADER
    bmiColors(255) As RGBQUAD

End Type

Private Const BI_RGB       As Long = 0

Private Const BI_BITFIELDS As Long = 3

'To get free bytes in drive
Private Declare Function GetDiskFreeSpace Lib "kernel32" Alias "GetDiskFreeSpaceExA" (ByVal lpRootPathName As String, _
                                                                                      FreeBytesToCaller As Currency, _
                                                                                      bytesTotal As Currency, _
                                                                                      FreeBytesTotal As Currency) As Long

''
' Searches for the specified InfoHeader.
'
' @param    ResourceFile A handler to the data file.
' @param    InfoHead The header searched.
' @param    FirstHead The first head to look.
' @param    LastHead The last head to look.
' @param    FileHeaderSize The bytes size of a FileHeader.
' @param    InfoHeaderSize The bytes size of a InfoHeader.
'
' @return   True if found.
'
' @remark   File must be already open.
' @remark   InfoHead must have set its file name to perform the search.

Private Function BinarySearch(ByRef ResourceFile As Integer, _
                              ByRef InfoHead As INFOHEADER, _
                              ByVal FirstHead As Long, _
                              ByVal LastHead As Long, _
                              ByVal FileHeaderSize As Long, _
                              ByVal InfoHeaderSize As Long) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/21/2007
    'Searches for the specified InfoHeader
    '*****************************************************************
    Dim ReadingHead  As Long
    Dim ReadInfoHead As INFOHEADER

    Do Until FirstHead > LastHead
        ReadingHead = (FirstHead + LastHead) \ 2

        Get ResourceFile, FileHeaderSize + InfoHeaderSize * (ReadingHead - 1) + 1, ReadInfoHead

        If InfoHead.strFileName = ReadInfoHead.strFileName Then
            InfoHead = ReadInfoHead
            BinarySearch = True
            Exit Function
        Else

            If InfoHead.strFileName < ReadInfoHead.strFileName Then
                LastHead = ReadingHead - 1
            Else
                FirstHead = ReadingHead + 1

            End If

        End If

    Loop

End Function

''
' Retrieves the InfoHead of the specified graphic file.
'
' @param    ResourcePath The resource file folder.
' @param    FileName The graphic file name.
' @param    InfoHead The InfoHead where data is returned.
'
' @return   True if found.

Private Function Get_InfoHeader(ByRef ResourcePath As String, ByRef FileName As String, ByRef InfoHead As INFOHEADER) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/21/2007
    'Retrieves the InfoHead of the specified graphic file
    '*****************************************************************
    Dim ResourceFile     As Integer
    Dim ResourceFilePath As String
    Dim FileHead         As FILEHEADER

    On Local Error GoTo ErrHandler

    ResourceFilePath = ResourcePath & GRH_RESOURCE_FILE

    'Set InfoHeader we are looking for
    InfoHead.strFileName = UCase$(FileName)

    'Open the binary file
    ResourceFile = FreeFile()
    Open ResourceFilePath For Binary Access Read Lock Write As ResourceFile
    'Extract the FILEHEADER
    Get ResourceFile, 1, FileHead

    'Check the file for validity
    If LOF(ResourceFile) <> FileHead.lngFileSize Then
        MsgBox "Archivo de recursos dañado. " & ResourceFilePath, , "Error"
        Close ResourceFile
        Exit Function

    End If

    'Search for it!
    If BinarySearch(ResourceFile, InfoHead, 1, FileHead.lngNumFiles, Len(FileHead), Len(InfoHead)) Then

        Get_InfoHeader = True

    End If

    Close ResourceFile
    Exit Function

ErrHandler:
    Close ResourceFile

    Call MsgBox("Error al intentar leer el archivo " & ResourceFilePath & ". Razón: " & Err.Number & " : " & Err.Description, vbOKOnly, "Error")

End Function

''
' Decompresses binary data.
'
' @param    data() The data array.
' @param    OrigSize The original data size.

Private Sub Decompress_Data(ByRef data() As Byte, ByVal OrigSize As Long)

    '*****************************************************************
    'Author: Juan Martín Dotuyo Dodero
    'Last Modify Date: 10/13/2004
    'Decompresses binary data
    '*****************************************************************
    Dim BufTemp() As Byte

    ReDim BufTemp(OrigSize - 1)

    Call uncompress(BufTemp(0), OrigSize, data(0), UBound(data) + 1)

    ReDim data(OrigSize - 1)

    data = BufTemp

    Erase BufTemp

End Sub

''
' Retrieves a byte array with the compressed data from the specified file.
'
' @param    ResourcePath The resource file folder.
' @param    InfoHead The header specifiing the graphic file info.
' @param    data() The byte array to return data.
'
' @return   True if no error occurred.
'
' @remark   InfoHead must not be encrypted.
' @remark   Data is not desencrypted.

Public Function Get_File_RawData(ByRef ResourcePath As String, ByRef InfoHead As INFOHEADER, ByRef data() As Byte) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/24/2007
    'Retrieves a byte array with the compressed data from the specified file
    '*****************************************************************
    Dim ResourceFilePath As String
    Dim ResourceFile     As Integer

    On Local Error GoTo ErrHandler
    ResourceFilePath = ResourcePath & GRH_RESOURCE_FILE

    'Size the Data array
    ReDim data(InfoHead.lngFileSize - 1)

    'Open the binary file
    ResourceFile = FreeFile
    Open ResourceFilePath For Binary Access Read Lock Write As ResourceFile
    'Get the data
    Get ResourceFile, InfoHead.lngFileStart, data
    'Close the binary file
    Close ResourceFile

    Get_File_RawData = True
    Exit Function

ErrHandler:
    Close ResourceFile

End Function

''
' Extract the specific file from a resource file.
'
' @param    ResourcePath The resource file folder.
' @param    InfoHead The header specifiing the graphic file info.
' @param    data() The byte array to return data.
'
' @return   True if no error occurred.
'
' @remark   Data is desencrypted.

Public Function Extract_File(ByRef ResourcePath As String, ByRef InfoHead As INFOHEADER, ByRef data() As Byte) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/20/2007
    'Extract the specific file from a resource file
    '*****************************************************************
    On Local Error GoTo ErrHandler

    If Get_File_RawData(ResourcePath, InfoHead, data) Then

        'Decompress all data
        If InfoHead.lngFileSize < InfoHead.lngFileSizeUncompressed Then
            Call Decompress_Data(data, InfoHead.lngFileSizeUncompressed)

        End If

        Extract_File = True

    End If

    Exit Function

ErrHandler:
    Call MsgBox("Error al intentar decodificar recursos. Razon: " & Err.Number & " : " & Err.Description, vbOKOnly, "Error")

End Function

''
' Retrieves a byte array with the specified file data.
'
' @param    ResourcePath The resource file folder.
' @param    FileName The graphic file name.
' @param    data() The byte array to return data.
'
' @return   True if no error occurred.
'
' @remark   Data is desencrypted.

Public Function Get_File_Data(ByRef ResourcePath As String, ByRef FileName As String, ByRef data() As Byte) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/21/2007
    'Retrieves a byte array with the specified file data
    '*****************************************************************
    Dim InfoHead As INFOHEADER

    If Get_InfoHeader(ResourcePath, FileName, InfoHead) Then
        'Extract!
        Get_File_Data = Extract_File(ResourcePath, InfoHead, data)
    Else
        Call MsgBox("No se se encontro el recurso " & FileName)

    End If

End Function

''
' Retrieves bitmap file data.
'
' @param    ResourcePath The resource file folder.
' @param    FileName The graphic file name.
' @param    bmpInfo The bitmap info structure.
' @param    data() The byte array to return data.
'
' @return   True if no error occurred.

Public Function Get_Bitmap(ByRef ResourcePath As String, ByRef FileName As String, ByRef bmpInfo As BITMAPINFO, ByRef data() As Byte) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 11/30/2007
    'Retrieves bitmap file data
    '*****************************************************************
    Dim InfoHead   As INFOHEADER
    Dim rawData()  As Byte
    Dim offBits    As Long
    Dim bitmapSize As Long
    Dim colorCount As Long

    If Get_InfoHeader(ResourcePath, FileName, InfoHead) Then

        'Extract the file and create the bitmap data from it.
        If Extract_File(ResourcePath, InfoHead, rawData) Then
            Call CopyMemory(offBits, rawData(10), 4)
            Call CopyMemory(bmpInfo.bmiHeader, rawData(14), 40)

            With bmpInfo.bmiHeader
                bitmapSize = AlignScan(.biWidth, .biBitCount) * Abs(.biHeight)

                If .biBitCount < 24 Or .biCompression = BI_BITFIELDS Or (.biCompression <> BI_RGB And .biBitCount = 32) Then

                    If .biClrUsed < 1 Then
                        colorCount = 2 ^ .biBitCount
                    Else
                        colorCount = .biClrUsed

                    End If

                    ' When using bitfields on 16 or 32 bits images, bmiColors has a 3-longs mask.
                    If .biBitCount >= 16 And .biCompression = BI_BITFIELDS Then colorCount = 3

                    Call CopyMemory(bmpInfo.bmiColors(0), rawData(54), colorCount * 4)

                End If

            End With

            ReDim data(bitmapSize - 1) As Byte
            Call CopyMemory(data(0), rawData(offBits), bitmapSize)

            Get_Bitmap = True

        End If

    Else
        Call MsgBox("No se encontro el recurso " & FileName)

    End If

End Function

Private Function AlignScan(ByVal inWidth As Long, ByVal inDepth As Integer) As Long

    '*****************************************************************
    'Author: Unknown
    'Last Modify Date: Unknown
    '*****************************************************************
    AlignScan = (((inWidth * inDepth) + &H1F) And Not &H1F&) \ &H8

End Function

''
' Retrieves the next InfoHeader.
'
' @param    ResourceFile A handler to the resource file.
' @param    FileHead The reource file header.
' @param    InfoHead The returned header.
' @param    ReadFiles The number of headers that have already been read.
'
' @return   False if there are no more headers tu read.
'
' @remark   File must be already open.
' @remark   Used to walk through the resource file info headers.
' @remark   The number of read files will increase although there is nothing else to read.
' @remark   InfoHead is encrypted.

Private Function ReadNext_InfoHead(ByRef ResourceFile As Integer, _
                                   ByRef FileHead As FILEHEADER, _
                                   ByRef InfoHead As INFOHEADER, _
                                   ByRef ReadFiles As Long) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 08/24/2007
    'Reads the next InfoHeader
    '*****************************************************************

    If ReadFiles < FileHead.lngNumFiles Then
        'Read header
        Get ResourceFile, Len(FileHead) + Len(InfoHead) * ReadFiles + 1, InfoHead

        'Update
        ReadNext_InfoHead = True

    End If

    ReadFiles = ReadFiles + 1

End Function

''
' Retrieves the next bitmap.
'
' @param    ResourcePath The resource file folder.
' @param    ReadFiles The number of bitmaps that have already been read.
' @param    bmpInfo The bitmap info structure.
' @param    data() The byte array to return data.
'
' @return   False if there are no more bitmaps tu get.
'
' @remark   Used to walk through the resource file bitmaps.

Public Function GetNext_Bitmap(ByRef ResourcePath As String, _
                               ByRef ReadFiles As Long, _
                               ByRef bmpInfo As BITMAPINFO, _
                               ByRef data() As Byte, _
                               ByRef fileIndex As Long) As Boolean

    '*****************************************************************
    'Author: Nicolas Matias Gonzalez (NIGO)
    'Last Modify Date: 12/02/2007
    'Reads the next InfoHeader
    '*****************************************************************
    On Error Resume Next

    Dim ResourceFile As Integer
    Dim FileHead     As FILEHEADER
    Dim InfoHead     As INFOHEADER
    Dim FileName     As String

    ResourceFile = FreeFile
    Open ResourcePath & GRH_RESOURCE_FILE For Binary Access Read Lock Write As ResourceFile
    Get ResourceFile, 1, FileHead

    If ReadNext_InfoHead(ResourceFile, FileHead, InfoHead, ReadFiles) Then

        Call Get_Bitmap(ResourcePath, InfoHead.strFileName, bmpInfo, data())
        FileName = Trim$(InfoHead.strFileName)
        fileIndex = CLng(Left$(FileName, Len(FileName) - 4))

        GetNext_Bitmap = True

    End If

    Close ResourceFile

End Function

''
' Retrieves the version number of a given resource file.
'
' @param    ResourceFilePath The resource file complete path.
'
' @return   The version number of the given file.

Public Function GetVersion(ByVal ResourceFilePath As String) As Long

    '*****************************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 11/23/2008
    '
    '*****************************************************************
    Dim ResourceFile As Integer
    Dim FileHead     As FILEHEADER

    ResourceFile = FreeFile()
    Open ResourceFilePath For Binary Access Read Lock Write As ResourceFile
    'Extract the FILEHEADER
    Get ResourceFile, 1, FileHead

    Close ResourceFile

    GetVersion = FileHead.lngFileVersion

End Function

