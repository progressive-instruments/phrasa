import {AntlrPhrasaExpressionTreeBuilder} from '../../dist/src/ExpressionTreeBuilder/AntlrPhrasaExpressionTreeBuilder.js'
import * as fs from 'fs';
import { PhrasaExpressionType } from '../../dist/src/PhrasaExpression.js';

class TextContent {
    constructor(name,file) {
      this.name = name;
      this.readAll = () => {
        return fs.readFileSync(file, 'utf8');
      }
    }
}

describe("expression tree builder", function() {
  it('general', function () {
    let expressionTreeBuilder = new AntlrPhrasaExpressionTreeBuilder();
    let expressionTree = expressionTreeBuilder.build(new TextContent("bla", "tests/files/simple.piece"));
    expect(expressionTree.expressions.length, 3);

    expect(expressionTree.expressions[0].type).toEqual(PhrasaExpressionType.SubjectExpression);
    let expression = expressionTree.expressions[0].subjectExpression;
    expect(expression.subject.value).toEqual('key');
    expect(expression.expressions[0].type).toEqual(PhrasaExpressionType.Value);
    expect(expression.expressions[0].value.value).toEqual('value');

    expect(expressionTree.expressions[1].type).toEqual(PhrasaExpressionType.SubjectExpression);
    expression = expressionTree.expressions[1].subjectExpression;
    expect(expression.subject.value).toEqual('key2');
    expect(expression.expressions[0].type).toEqual(PhrasaExpressionType.Value);
    expect(expression.expressions[0].value.value).toEqual('value2');

    expect(expressionTree.expressions[2].type).toEqual(PhrasaExpressionType.SubjectExpression);
    expression = expressionTree.expressions[2].subjectExpression;
    expect(expression.subject.value).toEqual('keyobj');
    expect(expression.expressions.length).toEqual(3);
    
    expect(expression.expressions[0].type).toEqual(PhrasaExpressionType.SubjectExpression);
    let innerexpression = expression.expressions[0].subjectExpression;
    expect(innerexpression.subject.value).toEqual('objkey');
    expect(innerexpression.expressions[0].type).toEqual(PhrasaExpressionType.Value);
    expect(innerexpression.expressions[0].value.value).toEqual('objval');

    expect(expression.expressions[1].type).toEqual(PhrasaExpressionType.SubjectExpression);
    innerexpression = expression.expressions[1].subjectExpression;
    expect(innerexpression.subject.value).toEqual('objobjkey');
    expect(innerexpression.expressions[0].type).toEqual(PhrasaExpressionType.Value);
    expect(innerexpression.expressions[0].value.value).toEqual('objobjval');

    
    expect(expression.expressions[2].type).toEqual(PhrasaExpressionType.SubjectExpression);
    innerexpression = expression.expressions[2].subjectExpression;
    expect(innerexpression.subject.value).toEqual('objkey2');
    expect(innerexpression.expressions[0].type).toEqual(PhrasaExpressionType.Value);
    expect(innerexpression.expressions[0].value.value).toEqual('objval2');


  });

});