If(!(test-path out))
{
      New-Item -ItemType Directory -Force -Path out
}
.\protoc.exe --plugin=protoc-gen-ts=.\node_modules\.bin\protoc-gen-ts.cmd --js_out="import_style=commonjs,binary:.\out" --ts_out=".\out" --cpp_out=".\out" .\note_message.proto