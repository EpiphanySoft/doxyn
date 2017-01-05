'use strict';

const Enum = require('../Enum');

class Message extends Enum {
}

Message.defineValues({
    TagInvalidInContext:        'E1000: Tag is not valid in this context',
    TagFailedToClassifyComment: 'E1001: Tag failed to classify comment',
    MultipleClassifiers:        'E1002: Comment has multiple classifier tags',
    TagDoesNotAcceptName:       'E1003: Tag does not accept a name component',
    TagDoesNotAcceptType:       'E1004: Tag does not accept a type component',
    TagDoesNotAcceptText:       'E1005: Tag does not accept a text component',
    TagMissingRequiredName:     'E1006: Tag is missing a required name component',
    TagMissingRequiredType:     'E1007: Tag is missing a required type component',
    TagMissingRequiredText:     'E1008: Tag is missing a required text component',

    // Tag-specific errors
    ExtendsMissingClassName:               'E1100: The @extends tag requires a class name',
    ExtendsOnlyValidForClasses:            'E1101: The @extends tag is only valid for classes',
    AliasMissingClassName:                 'E1102: The @alias tag requires a class name',
    AliasOnlyValidForClasses:              'E1103: The @alias tag is only valid for classes',
    AlternateClassNameMissingClassName:    'E1104: The @alternateClassName tag requires a class name',
    AlternateClassNameOnlyValidForClasses: 'E1105: The @alternateClassName tag is only valid for classes',
    RequiresOnlyValidForClasses:           'E1106: The @requires tag is only valid for classes',
    UsesOnlyValidForClasses:               'E1107: The @uses tag is only valid for classes',
    MixinsOnlyValidForClasses:             'E1108: The @mixins tag is only valid for classes',
    ClassNotFoundForExtend:                'E1109: Class used by @extend tag not found',
    ClassNotFoundForMixin:                 'E1110: Class used by @mixin tag not found',

    //------------------------------------------------------
    // Warnings

    // Processing warnings
    UnknownTag:   'W2000: Unknown tag detected',
    BadTagSyntax: 'W2001: Syntax error parsing tag',
    NoRootTag:    'W2002: No recognized root tag (ignoring comment)',

    // Tag-specific warnings
    MultipleAccessSpecifiers:           'W2100: Multiple access specifiers (use one @public, @protected or @private)',
    DeprecatedMissingMessage:           'W2101: Deprecated tags should include a message directing users to a suitable replacement',
    DeprecatedMissingVersion:           'W2102: Deprecated tags should include the version in which the member was deprecated',
    ExperimentalMissingMessage:         'W2103: Experimental tags should include a message explaining the existence of the class or member',
    ExperimentalMissingVersion:         'W2104: Experimental tags should include the version in which the member was introduced',
    RemovedMissingMessage:              'W2105: Removed tags should include a message directing users to a suitable replacement',
    RemovedMissingVersion:              'W2106: Removed tags should include the version in which the member was deprecated',
    DeclaredClassNameMismatch:          'W2107: Class name does not match detected name',
    DetectedBaseNotDocumented:          'W2108: Detected base class was omitted from declared @extend',
    DeclaredBaseHasNoMatch:             'W2109: Base class declared by @extend does not match detected bases',
    DetectedAliasNotDocumented:         'W2110: Detected alias was omitted from declared aliases',
    DeclaredAliasHasNoMatch:            'W2111: Declared alias does not match any detected aliases',
    DetectedAlternateNameNotDocumented: 'W2112: Detected alternateClassName was not declared',
    DeclaredAlternateNameHasNoMatch:    'W2113: Declared alternateClassName does not match any detected names',
    DetectedMixinNotDocumented:         'W2114: Detected mixin was not declared',
    DeclaredMixinHasNoMatch:            'W2115: Declared mixin does not match any detected names',
    DetectedRequiresNotDocumented:      'W2116: Detected requirement was omitted from declared requires',
    DeclaredRequiresHasNoMatch:         'W2117: Declared requirement does not match any detected requires',
    DetectedUsesNotDocumented:          'W2118: Detected uses was omitted from declared uses',
    DeclaredUsesHasNoMatch:             'W2119: Declared uses does not match any detected uses',
    DeclaredAbstractStateMismatch:      'W2120: Declared abstract status does not match detected value',
    DeclaredSingletonStateMismatch:     'W2121: Declared singleton status does not match detected value',
    ParameterNameDuplicated:            'W2122: Parameter name is a duplicate of a previous parameter',
    ParameterNameMismatch:              'W2123: Parameter name does not match detected name',
    ParameterNotDocumented:             'W2124: Parameter is not documented',
    ParameterNotDetected:               'W2125: Parameter not in method declaration',
    PropertyNotNestedProperly:          'W2126: Property names must all share root property name',
    ReturnTagDuplicated:                'W2127: Multiple top-level @return tags are not allowed',
    ReturnMemberDuplicated:             'W2128: Return directive contains duplicate member names',
    MemberMustSpecifyTypeOrName:        'W2129: The @member directive requires either a \"name\" or a \"{type}\" (not both)',
    TypeTagConflictsWithPropertyTag:    'W2130: The @property and @type tags cannot have different types',
    VarNameMismatch:                    'W2131: Variable name does not match detected name',
    LinkToMissingTarget:                'W2132: Link does not match a defined name',
    ReferenceIsAmbiguous:               'W2133: Link member name is ambiguous',
    ReferenceQualifierUnknown:          'W2134: Link qualifier is unknown',
    LinkSyntaxError:                    'W2135: Link is not syntactically valid',
    LinkHasNoTarget:                    'W2136: Link does not contain a target',
    DuplicateAlias:                     'W2137: Duplicate aliases',
    InheritedDocNotFound:               'W2138: Inherited doc reference does not match a defined name',
    InheritedDocCircularity:            'W2139: Inherited doc references are circular',
    MemberTargetNotFound:               'W2140: Target not found for @member directive',
    InvalidAccessorValue:               'W2141: Invalid value specified for @accessor directive'
});

module.exports = Message;
