import { types as t } from '@babel/core';
import convertToPropTypes from './convertBabelToPropTypes';
import extractGenericTypeNames from './extractGenericTypeNames';
import { createPropTypesObject, mergePropTypes } from './propTypes';
import { ConvertState } from './types';

function findStaticProperty(node: t.ClassDeclaration, name: string): any {
  return node.body.body.find(
    (property) =>
      t.isClassProperty(property, { static: true }) &&
      t.isIdentifier(property.key, { name }) &&
      (t.isObjectExpression(property.value) || t.isCallExpression(property.value)),
  );
}

export default function addToClass(node: t.ClassDeclaration, state: ConvertState) {
  if (!node.superTypeParameters || node.superTypeParameters.params.length <= 0) {
    return;
  }

  const defaultProps = findStaticProperty(node, 'defaultProps');
  const defaultPropsKeyList: string[] = [];

  if (defaultProps && t.isClassProperty(defaultProps) && t.isObjectExpression(defaultProps.value)) {
    defaultProps.value.properties.forEach((prop) => {
      if (t.isProperty(prop) && t.isIdentifier(prop.key)) {
        defaultPropsKeyList.push(prop.key.name);
      }
    });
  }

  const typeNames = extractGenericTypeNames(node.superTypeParameters.params[0]);
  const propTypesList = convertToPropTypes(
    state.componentTypes,
    typeNames,
    state,
    defaultPropsKeyList,
  );

  if (typeNames.length === 0 || propTypesList.length === 0) {
    return;
  }

  const propTypes = findStaticProperty(node, 'propTypes');

  if (propTypes) {
    (propTypes as any).value = mergePropTypes((propTypes as any).value, propTypesList, state);
  } else {
    const staticProperty = t.classProperty(
      t.identifier('propTypes'),
      createPropTypesObject(propTypesList, state),
    );

    // @ts-ignore
    staticProperty.static = true;

    node.body.body.unshift(staticProperty);
  }
}
